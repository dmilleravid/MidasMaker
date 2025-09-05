import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { JwtUser } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();


// Get current user info
router.get("/me", async (req: Request & { user?: JwtUser }, res) => {
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

// Get user by ID (admin/user access)
router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

export default router;
