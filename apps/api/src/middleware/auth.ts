import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// App JWT secret (use a safe default in dev only)
const APP_JWT_SECRET =
  process.env.JWT_SECRET || (process.env.VERCEL_ENV === "development" ? "dev_jwt_secret" : "");

export type JwtUser = { id: string; role: "admin" | "user" };

export function authenticateJWT(req: Request & { user?: JwtUser }, res: Response, next: NextFunction) {
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

export function requireRole(roles: Array<"admin" | "user">) {
  return (req: Request & { user?: JwtUser }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
