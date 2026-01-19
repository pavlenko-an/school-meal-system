import bcrypt from "bcryptjs";
import { prisma } from "@/shared/db/prisma";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { organizations } from "./seeds/organizations";
import { users } from "./seeds/users";
import { categories } from "./seeds/categories";
import { menuItems } from "./seeds/menu-items";
import { menuImages } from "./seeds/menu-images";
import { Prisma } from "@/generated/prisma/client";

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

    const localPath = `/uploads/menu-images/${img.fileName}`;

    await prisma.menuImage.upsert({
      where: {
        menuItemId_isPrimary: {
          menuItemId,
          isPrimary: img.isPrimary,
        },
      },
      update: {
        imageUrl: localPath,
      },
      create: {
        menuItemId,
        imageUrl: localPath,
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

  const schoolUser = await prisma.user.findUnique({
    where: { email: "sarah.greenwood@example.com" },
  });

  const supplierUser = await prisma.user.findUnique({
    where: { email: "bob.global@example.com" },
  });

  if (!school || !supplier || !schoolUser || !supplierUser) {
    console.warn(
      "Cannot create additional orders: missing school/supplier/users",
    );
  } else {
    const additionalOrders = [
      // 1. Новый заказ (только created → new, без переходов)
      {
        comment: "New draft order - January",
        deliveryDate: new Date("2026-03-10"),
        status: "new" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        history: [], // нет переходов
        items: [{ name: "Grilled Chicken Breast", qty: 8 }],
        schoolActor: false,
        supplierActor: false,
      },

      // 2. Опубликован школой
      {
        comment: "Published for bidding",
        deliveryDate: new Date("2026-02-10"),
        status: "published" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        history: [{ from: "new", to: "published" }],
        items: [{ name: "Vegetarian Pasta", qty: 15 }],
        schoolActor: true,
        supplierActor: false,
      },

      // 3. Принят поставщиком
      {
        comment: "Accepted by supplier",
        deliveryDate: new Date("2026-01-10"),
        status: "accepted" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        history: [
          { from: "new", to: "published" },
          { from: "published", to: "accepted" },
        ],
        items: [
          { name: "Beef Burger", qty: 25 },
          { name: "French Fries", qty: 40 },
        ],
        schoolActor: true,
        supplierActor: true,
      },

      // 4. В работе (accepted → in_progress), оплата verified
      {
        comment: "In progress - being prepared",
        deliveryDate: new Date("2025-12-10"),
        status: "in_progress" as OrderStatus,
        payment: "verified" as PaymentStatus,
        history: [
          { from: "new", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "in_progress" },
        ],
        items: [{ name: "Orange Juice", qty: 60 }],
        schoolActor: true,
        supplierActor: true,
      },

      // 5. Завершён (in_progress → completed)
      {
        comment: "Completed & delivered",
        deliveryDate: new Date("2025-11-10"),
        status: "completed" as OrderStatus,
        payment: "verified" as PaymentStatus,
        history: [
          { from: "new", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "in_progress" },
          { from: "in_progress", to: "completed" },
        ],
        items: [{ name: "Chocolate Brownie", qty: 30 }],
        schoolActor: true,
        supplierActor: true,
      },

      // 6. Отменён после published (school)
      {
        comment: "Cancelled by school - no longer needed",
        deliveryDate: new Date("2025-10-10"),
        status: "cancelled" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        history: [
          { from: "new", to: "published" },
          { from: "published", to: "cancelled" },
        ],
        items: [{ name: "Garden Salad", qty: 10 }],
        schoolActor: true,
        supplierActor: false,
      },

      // 7. Отменён после accepted (supplier, пока unpaid)
      {
        comment: "Cancelled by supplier - out of stock",
        deliveryDate: new Date("2025-09-10"),
        status: "cancelled" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        history: [
          { from: "new", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "cancelled" },
        ],
        items: [{ name: "Mashed Potatoes", qty: 18 }],
        schoolActor: true,
        supplierActor: true,
      },
    ];

    for (const ord of additionalOrders) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            schoolId: school.id,
            supplierId: ord.status !== "new" ? supplier.id : null,
            deliveryDate: ord.deliveryDate,
            orderStatus: ord.status,
            paymentStatus: ord.payment,
            totalPrice: 0,
            comment: ord.comment,
          },
        });

        let total = new Prisma.Decimal(0);

        for (const it of ord.items) {
          const menuItem = await tx.menuItem.findUnique({
            where: { name: it.name },
          });

          if (!menuItem) {
            console.warn(`Menu item not found: ${it.name}`);
            continue;
          }

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              menuItemId: menuItem.id,
              quantity: it.qty,
              price: menuItem.price,
            },
          });

          total = total.add(menuItem.price.mul(it.qty));
        }

        await tx.order.update({
          where: { id: order.id },
          data: { totalPrice: total },
        });

        for (const h of ord.history) {
          let actorId: string | undefined;

          if (
            h.to === "published" ||
            (h.to === "cancelled" && h.from === "published")
          ) {
            actorId = schoolUser.id;
          } else if (
            h.to === "accepted" ||
            h.to === "in_progress" ||
            h.to === "completed" ||
            (h.to === "cancelled" && h.from === "accepted")
          ) {
            actorId = supplierUser.id;
          }

          if (actorId) {
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                from: h.from as OrderStatus,
                to: h.to as OrderStatus,
                actorId,
              },
            });
          }
        }
      });
    }
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
