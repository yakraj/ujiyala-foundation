import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { ENV } from "../configs/env.js";

export function generateReceiptPDF(type, payload) {
  const dir = path.join(process.cwd(), "uploads", "pdfs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = `${type}-${Date.now()}-${Math.round(
    Math.random() * 1e9
  )}.pdf`;
  const fullPath = path.join(dir, filename);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const out = fs.createWriteStream(fullPath);
  doc.pipe(out);

  doc.fontSize(20).text(ENV.NGO_NAME, { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .text(
      `Official Receipt (${type.charAt(0).toUpperCase() + type.slice(1)})`,
      { align: "center" }
    );
  doc.moveDown(1);
  doc.text(`Date: ${new Date().toLocaleString()}`);
  doc.moveDown(0.5);

  if (type === "member") {
    doc.text(`Member Name: ${payload.name}`);
    if (payload.email) doc.text(`Email: ${payload.email}`);
    if (payload.phone) doc.text(`Phone: ${payload.phone}`);
    doc.text(`Membership Fee: ₹${payload.membershipFee?.toFixed(2)}`);
  } else if (type === "donation") {
    doc.text(`Donor: ${payload.donorName}`);
    if (payload.email) doc.text(`Email: ${payload.email}`);
    if (payload.phone) doc.text(`Phone: ${payload.phone}`);
    doc.text(`Amount: ₹${payload.amount?.toFixed(2)}`);
    if (payload.method) doc.text(`Method: ${payload.method}`);
    if (payload.note) doc.text(`Note: ${payload.note}`);
  }

  doc.moveDown(1);
  doc.text("Thank you for your support!", { align: "left" });
  doc.end();

  return new Promise((resolve) => {
    out.on("finish", () => resolve(`/uploads/pdfs/${filename}`));
  });
}
