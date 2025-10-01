import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { validate } from "../middleware/validate.js";
import { ENV } from "../configs/env.js";

const router = express.Router();

const registerSchema = {
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  }),
};

router.post("/register-admin", validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists)
    return res.status(409).json({ ok: false, message: "Email already exists" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: "admin" });
  return res.json({
    ok: true,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const loginSchema = {
  body: z.object({ email: z.string().email(), password: z.string() }),
};
router.post("/login", validate(loginSchema), async (req, res) => {
  console.log("Hello there");
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ ok: false, message: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid)
    return res.status(401).json({ ok: false, message: "Invalid credentials" });
  const token = jwt.sign(
    { sub: user._id, role: user.role, email: user.email },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    ok: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export default router;
