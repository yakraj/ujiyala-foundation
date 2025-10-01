import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
  const connState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
  res.json({ ok: true, dbConnected: connState === 1, connState });
});

export default router;
