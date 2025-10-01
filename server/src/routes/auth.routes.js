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
    role: z.string().optional(),
    memberType: z.string().optional(),
    initialPaidAmount: z.number().nonnegative().optional(),
  }),
};

router.post("/register-admin", validate(registerSchema), async (req, res) => {
  // Debug: log incoming body to help troubleshoot bad requests (remove in production)
  console.debug('/api/auth/register-admin incoming body:', JSON.stringify(req.body));
  const { name, email, password, role, memberType, initialPaidAmount } = req.body;
  const exists = await User.findOne({ email });
  if (exists)
    return res.status(409).json({ ok: false, message: "Email already exists" });
  const passwordHash = await bcrypt.hash(password, 10);

  // Normalize role and memberType inputs to lowercase strings
  const allowedRoles = ['president','vice_president','accountant','secretary','member','admin'];
  const allowedMemberTypes = ['honorary','general','founder'];
  const normalizedRole = role ? String(role).toLowerCase() : 'member';
  const normalizedMemberType = memberType ? String(memberType).toLowerCase() : 'general';

  // Validate normalized values, fallback to defaults if invalid
  const finalRole = allowedRoles.includes(normalizedRole) ? normalizedRole : 'member';
  const finalMemberType = allowedMemberTypes.includes(normalizedMemberType) ? normalizedMemberType : 'general';

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: finalRole,
    memberType: finalMemberType,
    initialPaidAmount: initialPaidAmount || 0,
  });
  return res.json({
    ok: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      memberType: user.memberType,
      initialPaidAmount: user.initialPaidAmount,
    },
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
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;
