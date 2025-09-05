import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { JwtUser } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

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

// Utility function to refresh Google access token
async function refreshGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    const googleAccount = await prisma.googleAccount.findUnique({
      where: { userId }
    });
    
    if (!googleAccount?.refreshToken) {
      return null;
    }
    
    googleClient.setCredentials({
      refresh_token: googleAccount.refreshToken
    });
    
    const { credentials } = await googleClient.refreshAccessToken();
    
    // Update the stored tokens
    await prisma.googleAccount.update({
      where: { userId },
      data: {
        accessToken: credentials.access_token || undefined,
        refreshToken: credentials.refresh_token || googleAccount.refreshToken,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
      }
    });
    
    return credentials.access_token || null;
  } catch (error) {
    console.error('Error refreshing Google access token:', error);
    return null;
  }
}

// Utility function to get a valid Google access token (current or refreshed)
async function getValidGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    const googleAccount = await prisma.googleAccount.findUnique({
      where: { userId }
    });
    
    if (!googleAccount?.accessToken) {
      return null;
    }
    
    // Check if token is expired (with 5 minute buffer)
    const now = new Date();
    const expiresAt = googleAccount.expiresAt;
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (expiresAt && new Date(expiresAt.getTime() - bufferTime) <= now) {
      // Token is expired or about to expire, refresh it
      return await refreshGoogleAccessToken(userId);
    }
    
    return googleAccount.accessToken;
  } catch (error) {
    console.error('Error getting valid Google access token:', error);
    return null;
  }
}


// Google OAuth: start
router.get("/start", (req, res) => {
  const state = req.query.next ? encodeURIComponent(String(req.query.next)) : undefined;
  const url = googleClient.generateAuthUrl({
    access_type: "offline", // This is crucial for getting refresh tokens
    scope: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    prompt: "consent", // This ensures we get a refresh token even if user previously authorized
    state: state,
  });
  res.redirect(url);
});

// Google OAuth: callback
router.get("/callback", async (req, res) => {
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
router.get(
  "/account",
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
router.post(
  "/disconnect",
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

// Refresh Google access token
router.post(
  "/refresh",
  async (req: Request & { user?: JwtUser }, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const newAccessToken = await refreshGoogleAccessToken(userId);
      if (!newAccessToken) {
        return res.status(400).json({ error: "No refresh token available or refresh failed" });
      }

      return res.json({ 
        success: true, 
        message: "Access token refreshed successfully",
        expiresIn: 3600 // Google access tokens typically last 1 hour
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      return res.status(500).json({ error: "Failed to refresh access token" });
    }
  }
);

export { refreshGoogleAccessToken, getValidGoogleAccessToken };
export default router;
