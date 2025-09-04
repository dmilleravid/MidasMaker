import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: passwordHash,
      name: "Admin User",
      role: Role.admin,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: passwordHash,
      name: "Regular User",
      role: Role.user,
    },
  });

  // Products (find-or-create by name)
  async function getOrCreateProduct(name: string, description: string, priceCents: number) {
    const found = await prisma.product.findFirst({ where: { name } });
    if (found) return found;
    return prisma.product.create({ data: { name, description, priceCents } });
  }

  const widget = await getOrCreateProduct("Widget", "A very useful widget", 1999);
  const gadget = await getOrCreateProduct("Gadget", "A shiny new gadget", 2999);

  // Order (find-or-create for the regular user)
  const existingOrder = await prisma.order.findFirst({
    where: { userId: user.id, productId: widget.id },
  });
  if (!existingOrder) {
    await prisma.order.create({
      data: { userId: user.id, productId: widget.id, quantity: 2 },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seed completed:", { admin: admin.email, user: user.email, products: [widget.name, gadget.name] });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


