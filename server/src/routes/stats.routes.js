import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { computeSummary } from '../services/balance.js';
import Member from '../models/Member.js';

const router = express.Router();

router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const sums = await computeSummary();
    const membersCount = await Member.countDocuments();
    res.json({ ok: true, ...sums, membersCount });
  } catch (e) { next(e); }
});

export default router;
