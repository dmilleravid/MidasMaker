import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get order by ID
router.get("/:id", async (req, res) => {
  const order = await prisma.order.findUnique({ 
    where: { id: req.params.id }, 
    include: { user: true, product: true } 
  });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

// Get all orders
router.get("/", async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, product: true },
  });
  res.json(orders);
});

export default router;
