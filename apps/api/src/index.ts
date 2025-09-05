import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import route modules
import authRoutes from "./routes/auth";
import googleOAuthRoutes from "./routes/google-oauth";
import userRoutes from "./routes/user";
import gmailRoutes from "./routes/gmail";
import driveRoutes from "./routes/drive";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";

// Import middleware
import { authenticateJWT, requireRole } from "./middleware/auth";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/google", googleOAuthRoutes);
app.use("/api/user", authenticateJWT, userRoutes);
app.use("/api/gmail", authenticateJWT, requireRole(["admin", "user"]), gmailRoutes);
app.use("/api/drive", authenticateJWT, requireRole(["admin", "user"]), driveRoutes);
app.use("/api/product", authenticateJWT, requireRole(["admin", "user"]), productRoutes);
app.use("/api/order", authenticateJWT, requireRole(["admin", "user"]), orderRoutes);

export { app };

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}