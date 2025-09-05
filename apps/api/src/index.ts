import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// App JWT secret (use a safe default in dev only)
const APP_JWT_SECRET =
  process.env.JWT_SECRET || (process.env.VERCEL_ENV === "development" ? "dev_jwt_secret" : "");

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";
const WEB_BASE_URL = process.env.WEB_BASE_URL || process.env.NEXT_PUBLIC_WEB_BASE_URL || "http://localhost:3000";

const googleClient = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
});

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
    if (!APP_JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });
    const payload = jwt.verify(token, APP_JWT_SECRET) as JwtUser;
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
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!APP_JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });
  const token = jwt.sign({ id: user.id, role: user.role }, APP_JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token });
});

// Email/password: register
app.post("/api/auth/register", async (req, res) => {
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
app.post("/api/auth/login-email", async (req, res) => {
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

// Endpoints per spec
app.get("/api/user/me", authenticateJWT, async (req: Request & { user?: JwtUser }, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user!.id },
      include: { googleAccount: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Return user info without sensitive data
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      googleAccount: user.googleAccount ? {
        googleId: user.googleAccount.googleId,
        email: user.googleAccount.email,
        name: user.googleAccount.name,
        picture: user.googleAccount.picture
      } : null
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

app.get("/api/products", authenticateJWT, requireRole(["admin", "user"]), async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  res.json(products);
});

app.get("/api/order/:id", authenticateJWT, requireRole(["admin", "user"]), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { user: true, product: true } });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

app.get("/api/orders", authenticateJWT, requireRole(["admin", "user"]), async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, product: true },
  });
  res.json(orders);
});

// Google OAuth: start
app.get("/api/auth/google/start", (req, res) => {
  const state = req.query.next ? encodeURIComponent(String(req.query.next)) : undefined;
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    prompt: "consent",
    state: state,
  });
  res.redirect(url);
});

// Google OAuth: callback
app.get("/api/auth/google/callback", async (req, res) => {
  try {
    const code = String(req.query.code || "");
    if (!code) return res.status(400).json({ error: "Missing code" });

    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Decode ID token for basic profile
    const idToken = tokens.id_token || "";
    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: "Invalid token" });

    const googleId = String(payload.sub);
    const email = payload.email || null;
    const name = payload.name || null;
    const picture = payload.picture || null;
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    // Upsert user and google account
    let user = await prisma.user.findFirst({ where: { email: email || undefined } });
    if (!user) {
      // Create a user that satisfies required fields
      user = await prisma.user.create({
        data: {
          mobile: `google:${googleId}`,
          email: email || undefined,
          name: name || undefined,
          password: `oauth_${googleId}`,
        },
      });
    }

    await prisma.googleAccount.upsert({
      where: { userId: user.id },
      update: {
        googleId,
        email: email || undefined,
        name: name || undefined,
        picture: picture || undefined,
        accessToken: tokens.access_token || undefined,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: expiresAt || undefined,
      },
      create: {
        userId: user.id,
        googleId,
        email: email || undefined,
        name: name || undefined,
        picture: picture || undefined,
        accessToken: tokens.access_token || undefined,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: expiresAt || undefined,
      },
    });

    // Issue app JWT (map to generic user role)
    if (!APP_JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }
    const token = jwt.sign({ id: user.id, role: "user" }, APP_JWT_SECRET, { expiresIn: "7d" });
    
    // Preserve the 'next' parameter from state if it exists
    const next = req.query.state ? `&next=${req.query.state}` : '';
    return res.redirect(`${WEB_BASE_URL}/google-oauth/success?token=${encodeURIComponent(token)}${next}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "OAuth failed" });
  }
});

// Google account info for current user
app.get(
  "/api/auth/google/account",
  authenticateJWT,
  requireRole(["admin", "user"]),
  async (req: Request & { user?: JwtUser }, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const account = await prisma.googleAccount.findUnique({
      where: { userId },
      select: {
        id: true,
        googleId: true,
        email: true,
        name: true,
        picture: true,
        expiresAt: true,
        createdAt: true,
        accessToken: true,
        refreshToken: true,
      },
    });

    if (!account) return res.json({ connected: false, account: null });

    const { accessToken, refreshToken, ...publicFields } = account;
    const connected = Boolean(refreshToken || accessToken);
    return res.json({ connected, account: publicFields });
  }
);

// Disconnect Google: revoke tokens and clear from DB
app.post(
  "/api/auth/google/disconnect",
  authenticateJWT,
  requireRole(["admin", "user"]),
  async (req: Request & { user?: JwtUser }, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const account = await prisma.googleAccount.findUnique({ where: { userId } });
    if (!account) return res.json({ disconnected: true });

    try {
      if (account.refreshToken) {
        await googleClient.revokeToken(account.refreshToken);
      }
      if (account.accessToken) {
        await googleClient.revokeToken(account.accessToken);
      }
    } catch (_err) {
      // ignore revoke errors
    }

    await prisma.googleAccount.update({
      where: { userId },
      data: { accessToken: null, refreshToken: null, expiresAt: null },
    });

    return res.json({ disconnected: true });
  }
);

export { app };

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}


