import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import Member from '../models/Member.js';
import { generateReceiptPDF } from '../services/pdf.js';

const router = express.Router();

const createSchema = {
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    membershipFee: z.number().min(0).default(0)
  })
};

router.post('/', requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const member = await Member.create(req.body);
    const pdfPath = await generateReceiptPDF('member', member.toObject());
    member.receiptPdfPath = pdfPath;
    await member.save();
    res.json({ ok: true, member });
  } catch (e) { next(e); }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, members });
  } catch (e) { next(e); }
});

export default router;
