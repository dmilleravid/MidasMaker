import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();
const prisma = new PrismaClient();

// App JWT secret (use a safe default in dev only)
const APP_JWT_SECRET =
  process.env.JWT_SECRET || (process.env.VERCEL_ENV === "development" ? "dev_jwt_secret" : "");

// Sample auth route to issue tokens (temporary)
router.post("/login", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!APP_JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });
  const token = jwt.sign({ id: user.id, role: user.role }, APP_JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token });
});

// Email/password: register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });
    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await prisma.user.create({
      data: { email, password: passwordHash, name: name || undefined, mobile: `email:${Date.now()}` },
    });
    if (!APP_JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });
    const token = jwt.sign({ id: user.id, role: "user" }, APP_JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Registration failed" });
  }
});

// Email/password: login
router.post("/login-email", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    if (!APP_JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });
    const token = jwt.sign({ id: user.id, role: "user" }, APP_JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
});

export default router;
