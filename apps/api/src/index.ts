import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

type JwtUser = { id: string; role: "admin" | "user" };

function authenticateJWT(req: Request & { user?: JwtUser }, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  // Allow bypass in development to simplify local integration
  if (!authHeader) {
    if (process.env.VERCEL_ENV === "development") {
      req.user = { id: "dev-user", role: "user" };
      return next();
    }
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const token = authHeader.replace(/^Bearer\s+/i, "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtUser;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireRole(roles: Array<"admin" | "user">) {
  return (req: Request & { user?: JwtUser }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Sample auth route to issue tokens (temporary)
app.post("/api/auth/login", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  return res.json({ token });
});

// Endpoints per spec
app.get("/api/user/:id", authenticateJWT, requireRole(["admin", "user"]), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

app.get("/api/product/:id", authenticateJWT, requireRole(["admin", "user"]), async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

app.get("/api/order/:id", authenticateJWT, requireRole(["admin", "user"]), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { user: true, product: true } });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

export { app };

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}


