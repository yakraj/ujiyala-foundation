import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import Donation from '../models/Donation.js';
import { generateReceiptPDF } from '../services/pdf.js';

const router = express.Router();

const createSchema = {
  body: z.object({
    donorName: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    amount: z.number().min(1),
    method: z.enum(['cash','upi','bank','card','other']).default('cash'),
    date: z.string().optional(),
    note: z.string().optional().or(z.literal(''))
  })
};

router.post('/', requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.date) body.date = new Date(body.date);
    const donation = await Donation.create(body);
    const pdfPath = await generateReceiptPDF('donation', donation.toObject());
    donation.receiptPdfPath = pdfPath;
    await donation.save();
    res.json({ ok: true, donation });
  } catch (e) { next(e); }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, donations });
  } catch (e) { next(e); }
});

export default router;
