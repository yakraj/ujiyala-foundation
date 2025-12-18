import express from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import Donation from "../models/Donation.js";

const router = express.Router();

const createSchema = {
  body: z.object({
    donorName: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    amount: z.number().min(1),
    method: z.enum(["cash", "upi", "bank", "card", "other"]).default("cash"),
    date: z.string().optional(),
    note: z.string().optional().or(z.literal("")),
  }),
};

router.post(
  "/",
  requireAuth,
  validate(createSchema),
  async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (body.date) body.date = new Date(body.date);
      // mark who added it; it remains unverified until accountant verifies
      body.addedBy = req.user.sub;
      const donation = await Donation.create(body);
      res.json({ ok: true, donation });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, donations });
  } catch (e) {
    next(e);
  }
});

// list pending (unverified) donations
router.get("/pending", requireAuth, async (req, res, next) => {
  try {
    console.debug(
      "/api/donations/pending called by user:",
      req.user && { sub: req.user.sub, role: req.user.role }
    );
    const donations = await Donation.find({ verified: false })
      .sort({ createdAt: -1 })
      .limit(200);
    console.debug("pending donations found:", donations.length);
    // populate addedBy and verifiedBy user names if possible
    const User = (await import("../models/User.js")).default;
    const enriched = await Promise.all(
      donations.map(async (d) => {
        const obj = d.toObject();
        if (obj.addedBy) {
          const u = await User.findById(obj.addedBy).select("name");
          obj.addedByName = u?.name || obj.addedBy;
        }
        return obj;
      })
    );
    res.json({ ok: true, donations: enriched });
  } catch (e) {
    next(e);
  }
});

// Bulk verify donations (accountant only)
router.post("/verify-bulk", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "accountant")
      return res.status(403).json({ ok: false, message: "Forbidden" });
    const ids = req.body?.ids || [];
    const results = [];
    for (const id of ids) {
      const donation = await Donation.findById(id);
      if (!donation) continue;
      donation.verified = true;
      donation.paymentVerified = true;
      donation.verifiedBy = req.user.sub;
      donation.receivedBy = req.user.sub;
      // Generate receipt ID when verified
      if (!donation.receiptId) {
        donation.receiptId = `REC-${uuidv4().slice(0, 8).toUpperCase()}`;
      }
      await donation.save();
      results.push(donation.toObject());
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("stats-update");
    }

    res.json({ ok: true, results });
  } catch (e) {
    next(e);
  }
});

export default router;

// Accountant-only verify endpoint (kept at bottom for clarity)
router.post("/:id/verify", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "accountant")
      return res.status(403).json({ ok: false, message: "Forbidden" });
    const id = req.params.id;
    const donation = await Donation.findById(id);
    if (!donation)
      return res.status(404).json({ ok: false, message: "Not found" });
    donation.verified = true;
    donation.paymentVerified = true;
    donation.verifiedBy = req.user.sub;
    donation.receivedBy = req.user.sub;
    // Generate receipt ID when verified
    if (!donation.receiptId) {
      donation.receiptId = `REC-${uuidv4().slice(0, 8).toUpperCase()}`;
    }
    await donation.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("stats-update");
      io.emit("new-donation", {
        donorName: donation.donorName,
        amount: donation.amount,
        date: donation.date,
        note: donation.note,
        method: donation.method,
      });
    }

    res.json({ ok: true, donation });
  } catch (e) {
    next(e);
  }
});
