import bcrypt from "bcryptjs";
import { prisma } from "@/shared/db/prisma";
import { OrderStatus } from "@/generated/prisma/enums";
import { organizations } from "./seeds/organizations";
import { users } from "./seeds/users";
import { categories } from "./seeds/categories";
import { menuItems } from "./seeds/menu-items";
import { menuImages } from "./seeds/menu-images";

async function main() {
  console.log("Clearing database...");

  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuImage.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log("Database cleared successfully.");
  console.log("Seeding database...");

  for (const org of organizations) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: org,
      create: {
        ...org,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: hashed,
        role: u.role,
        organizationId: u.organizationId,
      },
      create: {
        email: u.email,
        passwordHash: hashed,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        organizationId: u.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: {
        name: cat.name,
        description: cat.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    categoryMap.set(cat.name, created.id);
  }

  const menuItemMap = new Map<string, string>();

  for (const item of menuItems) {
    const catId = categoryMap.get(item.category);
    if (!catId) continue;

    const menuItem = await prisma.menuItem.upsert({
      where: { name: item.name },
      update: {
        price: item.price,
        categoryId: catId,
        isAvailable: true,
      },
      create: {
        name: item.name,
        price: item.price,
        categoryId: catId,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    menuItemMap.set(item.name, menuItem.id);
  }

  for (const img of menuImages) {
    const menuItemId = menuItemMap.get(img.itemName);
    if (!menuItemId) {
      console.warn(`Missing menuItem for ${img.itemName}`);
      continue;
    }

    await prisma.menuImage.upsert({
      where: {
        menuItemId_isPrimary: {
          menuItemId,
          isPrimary: img.isPrimary,
        },
      },
      update: {
        imageUrl: img.imageUrl,
      },
      create: {
        menuItemId,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  const school = await prisma.organization.findUnique({
    where: { id: organizations[0].id },
  });

  const supplier = await prisma.organization.findUnique({
    where: { id: organizations[1].id },
  });

  if (school && supplier) {
    const order = await prisma.order.create({
      data: {
        schoolId: school.id,
        supplierId: supplier.id,
        deliveryDate: new Date("2025-10-15"),
        status: OrderStatus.new,
        totalPrice: 0,
        comment: "Initial order for October",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const itemsToOrder = [
      { name: "Grilled Chicken Breast", qty: 12 },
      { name: "Garden Salad", qty: 20 },
      { name: "Orange Juice", qty: 30 },
      { name: "Chocolate Brownie", qty: 15 },
    ];

    let total = 0;

    for (const it of itemsToOrder) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { name: it.name },
      });

      if (!menuItem) continue;

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: menuItem.id,
          quantity: it.qty,
          price: menuItem.price,
          addedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      total += Number(menuItem.price) * it.qty;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { totalPrice: total },
    });
  }

  console.log("Database seeded successfully!");
}
main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
