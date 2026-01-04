import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import Expense from "../models/Expense.js";
import {
  uploadImage,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/cloudinary.js";

const router = express.Router();
const createSchema = {
  body: z.object({
    date: z.string(),
    by: z.string().min(2),
    amount: z.string(),
    totalAmount: z.string().optional(),
    paymentType: z.enum(["complete", "partial"]).optional(),
    category: z.string().optional().or(z.literal("")),
    note: z.string().optional().or(z.literal("")),
  }),
};

router.post(
  "/",
  requireAuth,
  uploadImage,
  uploadToCloudinary,
  async (req, res, next) => {
    console.log(req.body);
    try {
      if (req.user.role !== "accountant")
        return res.status(403).json({ ok: false, message: "Forbidden" });
      const parsed = createSchema.body.parse(req.body);

      const amount = Number(parsed.amount);
      const totalAmount =
        parsed.paymentType === "partial" && parsed.totalAmount
          ? Number(parsed.totalAmount)
          : amount;

      const body = {
        ...parsed,
        date: new Date(parsed.date),
        amount: amount,
        totalAmount: totalAmount,
        paymentType: parsed.paymentType || "complete",
        status:
          parsed.paymentType === "partial" && amount < totalAmount
            ? "partial"
            : "paid",
        payments: [
          {
            amount: amount,
            date: new Date(parsed.date),
            by: parsed.by,
            note: "Initial payment",
          },
        ],
      };

      // For compatibility, copy 'note' into lowercase 'description' and legacy 'Description'
      if (parsed.note) {
        body.description = parsed.note;
        body.Description = parsed.note;
      }

      // Store Cloudinary URL if image was uploaded
      if (req.file && req.file.cloudinaryUrl) {
        body.receiptImagePath = req.file.cloudinaryUrl;
        body.receiptImagePublicId = req.file.cloudinaryPublicId;
      }

      const expense = await Expense.create(body);

      const io = req.app.get("io");
      if (io) {
        io.emit("stats-update");
        io.emit("new-expense", {
          date: expense.date,
          by: expense.by,
          amount: expense.amount,
          category: expense.category,
          note: expense.note,
          description: expense.description,
        });
      }

      res.json({ ok: true, expense });
    } catch (e) {
      next(e);
    }
  }
);

router.put("/:id/pay", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "accountant")
      return res.status(403).json({ ok: false, message: "Forbidden" });

    const { amount, date, by, note } = req.body;
    const payAmount = Number(amount);

    const expense = await Expense.findById(req.params.id);
    if (!expense)
      return res.status(404).json({ ok: false, message: "Expense not found" });

    if (expense.status === "paid") {
      return res
        .status(400)
        .json({ ok: false, message: "Expense is already fully paid" });
    }

    const newPaidAmount = expense.amount + payAmount;
    if (newPaidAmount > expense.totalAmount) {
      return res
        .status(400)
        .json({ ok: false, message: "Amount exceeds payable amount" });
    }

    expense.amount = newPaidAmount;
    expense.payments.push({
      amount: payAmount,
      date: date ? new Date(date) : new Date(),
      by: by || req.user.name || "Accountant",
      note: note || "Partial payment",
    });

    if (expense.amount >= expense.totalAmount) {
      expense.status = "paid";
    }

    await expense.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("stats-update");
    }

    res.json({ ok: true, expense });
  } catch (e) {
    next(e);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ ok: true, expenses });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ ok: false, message: "Expense not found" });
    }

    // Delete image from Cloudinary if it exists
    if (expense.receiptImagePublicId) {
      try {
        await deleteFromCloudinary(expense.receiptImagePublicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // Continue with expense deletion even if image deletion fails
      }
    }

    await Expense.findByIdAndDelete(req.params.id);

    const io = req.app.get("io");
    if (io) {
      io.emit("stats-update");
    }

    res.json({ ok: true, message: "Expense deleted successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
