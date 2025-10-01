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
      const parsed = createSchema.body.parse(req.body);
      const body = {
        ...parsed,
        date: new Date(parsed.date),
      };

      // Store Cloudinary URL if image was uploaded
      if (req.file && req.file.cloudinaryUrl) {
        body.receiptImagePath = req.file.cloudinaryUrl;
        body.receiptImagePublicId = req.file.cloudinaryPublicId;
      }

      const expense = await Expense.create(body);
      res.json({ ok: true, expense });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 }).limit(200);
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
    res.json({ ok: true, message: "Expense deleted successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
