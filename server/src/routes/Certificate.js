import fs from "fs";
import path from "path";
import express from "express";
import { spawn } from "child_process";
import CDP from "chrome-remote-interface";
import { pathToFileURL, fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Build a file:// URL for Chrome navigation
const fileUrl = (p) => pathToFileURL(p).href;

// Locate Chrome or Edge installation on Windows
function findChrome() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    "Chrome or Edge not found. Install Chrome or Edge or update the paths."
  );
}

// //locate installation for docker container
// function findChrome() {
//   const candidates = [
//     // Linux (Render)
//     "/usr/bin/google-chrome",
//     "/usr/bin/chromium-browser",
//     "/usr/bin/chromium",

//     // Windows
//     "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
//     "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//     "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
//     "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",

//     // macOS
//     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
//   ];

//   for (const p of candidates) {
//     if (fs.existsSync(p)) return p;
//   }

//   throw new Error("Chrome or Edge not found. Install Chrome or update paths.");
// }

// Simple promise wait helper
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST /api/certificate -> returns generated certificate PDF
router.post("/", express.json(), async (req, res) => {
  try {
    console.log("Received certificate request:", req.body);

    const { name, Date: startDateString, membershipNo } = req.body;

    // -----------------------------
    // 1. PROCESS NAME
    // -----------------------------
    let processedName = name;

    const parts = name.trim().split(/\s+/); // split by spaces

    if (parts.length === 3) {
      // Example: "Sunil Haribhau Aher"
      const first = parts[0];
      const middle = parts[1][0].toUpperCase() + "."; // H.
      const last = parts[2];

      processedName = `${first} ${middle} ${last}`;
    }

    // -----------------------------
    // 2. DETECT MEMBERSHIP TYPE
    // -----------------------------
    const memPrefix = membershipNo.split("-")[0].toUpperCase(); // PM or GM

    let membershipType = "";
    let yearsToAdd = 0;

    if (memPrefix === "PM") {
      membershipType = "Permanent (Honorary) Member";
      yearsToAdd = 5;
    } else if (memPrefix === "GM") {
      membershipType = "General Member";
      yearsToAdd = 1;
    } else {
      membershipType = "Unknown";
      yearsToAdd = 1; // default one year
    }

    // -----------------------------
    // 3. CALCULATE END DATE
    // -----------------------------
    const startDate = new Date(startDateString);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + yearsToAdd);

    const formattedStartDate = startDate.toDateString();
    const formattedEndDate = endDate.toDateString();

    // -----------------------------
    // 4. SEND FINAL RESPONSE
    // -----------------------------
    const result = {
      originalName: name,
      processedName,
      membershipNo,
      membershipType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      yearsAdded: yearsToAdd,
    };

    console.log("Processed certificate data:", result);

    // -----------------------------
    // END OF TRY BLOCK
    // -----------------------------

    const indexPath = path.join(__dirname, "index.html");
    const selector = "#certificate-wrapper"; // Fixed A4 wrapper

    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("index.html not found in server directory.");
    }

    let chromeProc;
    let client;

    try {
      const chromePath = findChrome();

      // Launch a real Chrome instance
      chromeProc = spawn(
        chromePath,
        [
          "--headless=new",
          "--disable-gpu",
          "--remote-debugging-port=9222",
          "--hide-scrollbars",
        ],
        { windowsHide: true }
      );

      // Wait for Chrome debugging port to open
      await wait(500);

      // Connect to Chrome DevTools Protocol
      client = await CDP({ port: 9222 });
      const { Page, Runtime, Emulation } = client;

      await Page.enable();

      // Minimal viewport just to load the page
      await Emulation.setDeviceMetricsOverride({
        width: 1200,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });

      // Open local HTML file
      await Page.navigate({ url: fileUrl(indexPath) });
      await Page.loadEventFired();

      // Allow fonts & images to load fully
      await wait(400);

      // Measure the certificate wrapper
      const rectResult = await Runtime.evaluate({
        expression: `
        (function(){
          const el = document.querySelector("${selector}");
          if (!el) return { error: true };
          const r = el.getBoundingClientRect();
          return {
            width: r.width,
            height: r.height
          };
        })()
      `,
        returnByValue: true,
      });
      await Runtime.evaluate({
        expression: `
    (function(){
      const nameEl = document.querySelector('.block_5');
      if (nameEl) nameEl.innerHTML = "${processedName}";

      const firstPara = document.querySelector('.block_6');
      if (firstPara) {
        firstPara.innerHTML =
          "has officially become a ${membershipType} of the Ujiyala Foundation, effective from ${formattedStartDate}, under Membership No. ${membershipNo}.";
      }

      const all6 = document.querySelectorAll('.block_6');
      if (all6.length > 1) {
        all6[1].innerHTML =
          "As a member, ${name} pledges to uphold the Foundation’s vision of empowering lives, serving communities, and spreading hope. This membership remains valid until ${formattedEndDate}.";
      }

      return true;
    })()
  `,
      });

      const rect = rectResult.result.value;

      if (!rect || rect.error) {
        return res
          .status(500)
          .send("Could not find #certificate-wrapper in HTML.");
      }

      const widthPx = rect.width;
      const heightPx = rect.height;

      // Convert px → inches (Chrome PDF uses 96 pixels = 1 inch)
      const widthInches = widthPx / 96;
      const heightInches = heightPx / 96;

      // Generate perfect-size PDF matching the certificate div
      const pdf = await Page.printToPDF({
        printBackground: true,
        landscape: true, // Force landscape orientation
        scale: 1, // Do not shrink or fit - 1:1 output
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        pageRanges: "1",
        marginRight: 0,
        preferCSSPageSize: true, // CRITICAL: use @page size instead of A4 default
      });

      const buffer = Buffer.from(pdf.data, "base64");

      // Generate filename from member name with proper encoding
      const filename = `${name} Certificate (Ujiyala Foundation).pdf`;
      const encodedFilename = encodeURIComponent(filename);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodedFilename}; filename="${filename}"`
      );
      res.send(buffer);

      // Cleanup
      await client.close();
      chromeProc.kill("SIGTERM");
    } catch (err) {
      console.error("Export error:", err);

      if (client)
        try {
          await client.close();
        } catch {}
      if (chromeProc)
        try {
          chromeProc.kill("SIGTERM");
        } catch {}

      res.status(500).send("Error: " + err.message);
    }

    // res.json(result);
  } catch (err) {
    console.error("Error in POST /api/certificate:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/certificate/export -> debugging/manual export (no dynamic data)
router.get("/export", async (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  const selector = "#certificate-wrapper"; // Fixed A4 wrapper

  if (!fs.existsSync(indexPath)) {
    return res.status(404).send("index.html not found in server directory.");
  }

  let chromeProc;
  let client;

  try {
    const chromePath = findChrome();

    // Launch a real Chrome instance
    chromeProc = spawn(
      chromePath,
      [
        "--headless=new",
        "--disable-gpu",
        "--remote-debugging-port=9222",
        "--hide-scrollbars",
      ],
      { windowsHide: true }
    );

    // Wait for Chrome debugging port to open
    await wait(500);

    // Connect to Chrome DevTools Protocol
    client = await CDP({ port: 9222 });
    const { Page, Runtime, Emulation } = client;

    await Page.enable();

    // Minimal viewport just to load the page
    await Emulation.setDeviceMetricsOverride({
      width: 1200,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Open local HTML file
    await Page.navigate({ url: fileUrl(indexPath) });
    await Page.loadEventFired();

    // Allow fonts & images to load fully
    await wait(400);

    // Measure the certificate wrapper
    const rectResult = await Runtime.evaluate({
      expression: `
        (function(){
          const el = document.querySelector("${selector}");
          if (!el) return { error: true };
          const r = el.getBoundingClientRect();
          return {
            width: r.width,
            height: r.height
          };
        })()
      `,
      returnByValue: true,
    });

    const rect = rectResult.result.value;

    if (!rect || rect.error) {
      return res
        .status(500)
        .send("Could not find #certificate-wrapper in HTML.");
    }

    const widthPx = rect.width;
    const heightPx = rect.height;

    // Convert px → inches (Chrome PDF uses 96 pixels = 1 inch)
    const widthInches = widthPx / 96;
    const heightInches = heightPx / 96;

    // Generate perfect-size PDF matching the certificate div
    const pdf = await Page.printToPDF({
      printBackground: true,
      landscape: true, // Force landscape orientation
      scale: 1, // Do not shrink or fit - 1:1 output
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      pageRanges: "1",
      marginRight: 0,
      preferCSSPageSize: true, // CRITICAL: use @page size instead of A4 default
    });

    const buffer = Buffer.from(pdf.data, "base64");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=certificate.pdf"
    );
    res.send(buffer);

    // Cleanup
    await client.close();
    chromeProc.kill("SIGTERM");
  } catch (err) {
    console.error("Export error:", err);

    if (client)
      try {
        await client.close();
      } catch {}
    if (chromeProc)
      try {
        chromeProc.kill("SIGTERM");
      } catch {}

    res.status(500).send("Error: " + err.message);
  }
});

export default router;
