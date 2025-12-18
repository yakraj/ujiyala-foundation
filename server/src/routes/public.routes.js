import express from "express";
import Donation from "../models/Donation.js";
import Expense from "../models/Expense.js";
import Member from "../models/Member.js";

const router = express.Router();

// GET /api/public/stats
router.get("/stats", async (req, res, next) => {
  try {
    const totalDonations = await Donation.aggregate([
      { $match: { verified: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const activeMembers = await Member.countDocuments();

    res.json({
      ok: true,
      stats: {
        totalDonations: totalDonations[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        activeMembers,
      },
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/public/donations
router.get("/donations", async (req, res, next) => {
  try {
    const donations = await Donation.find({ verified: true })
      .sort({ date: -1 })
      .limit(10)
      .select("donorName amount date note method");

    res.json({ ok: true, donations });
  } catch (e) {
    next(e);
  }
});

// GET /api/public/expenses
router.get("/expenses", async (req, res, next) => {
  try {
    const expenses = await Expense.find()
      .sort({ date: -1 })
      .limit(10)
      .select("date by amount category note description");

    res.json({ ok: true, expenses });
  } catch (e) {
    next(e);
  }
});

// POST /api/public/donate
router.post("/donate", async (req, res, next) => {
  try {
    const { donorName, email, phone, amount, note, method } = req.body;

    const donation = await Donation.create({
      donorName,
      email,
      phone,
      amount: Number(amount),
      note,
      method: method || "upi",
      verified: false, // Public donations must be verified by admin/accountant
    });

    // We don't emit socket events here because it's not verified yet.
    // The admin will verify it, and then the socket event will be emitted from donations.routes.js

    res.json({ ok: true, donation });
  } catch (e) {
    next(e);
  }
});

export default router;
