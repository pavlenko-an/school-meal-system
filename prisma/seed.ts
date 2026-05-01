import bcrypt from "bcryptjs";
import { prisma } from "@/shared/db/prisma";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { organizations } from "./seeds/organizations";
import { users } from "./seeds/users";
import { categories } from "./seeds/categories";
import { menuItems } from "./seeds/menu-items";
import { Prisma } from "@/generated/prisma/client";

async function main() {
  console.log("Clearing database...");

  await prisma.orderItem.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderPaymentHistory.deleteMany({});
  await prisma.order.deleteMany({});
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
        avatarUrl: u.avatarUrl,
      },
      create: {
        email: u.email,
        passwordHash: hashed,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        organizationId: u.organizationId,
        avatarUrl: u.avatarUrl,
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
        description: item.description,
        imageUrl: item.imageUrl,
        categoryId: catId,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    menuItemMap.set(item.name, menuItem.id);
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
      {
        comment: "New draft order - June",
        deliveryDate: new Date("2026-06-10"),
        status: "draft" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [],
        paymentHistory: [],
        items: [{ name: "Смажена куряча грудка", qty: 8 }],
        schoolActor: false,
        supplierActor: false,
      },

      {
        comment: "New draft order - June",
        deliveryDate: new Date("2026-06-20"),
        status: "draft" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [],
        paymentHistory: [],
        items: [{ name: "Смажена куряча грудка", qty: 8 }],
        schoolActor: false,
        supplierActor: false,
      },

      {
        comment: "Published for bidding",
        deliveryDate: new Date("2026-05-10"),
        status: "published" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [{ from: "draft", to: "published" }],
        paymentHistory: [],
        items: [{ name: "Вегетаріанська паста", qty: 15 }],
        schoolActor: true,
        supplierActor: false,
        published: new Date(),
      },

      {
        comment: "Published for bidding",
        deliveryDate: new Date("2026-05-20"),
        status: "published" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [{ from: "draft", to: "published" }],
        paymentHistory: [],
        items: [{ name: "Вегетаріанська паста", qty: 15 }],
        schoolActor: true,
        supplierActor: false,
        published: new Date(),
      },

      {
        comment: "Accepted by supplier",
        deliveryDate: new Date("2026-04-10"),
        status: "accepted" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "accepted" },
        ],
        paymentHistory: [],
        items: [
          { name: "Бургер з яловичини", qty: 25 },
          { name: "Картопля фрі", qty: 40 },
        ],
        schoolActor: true,
        supplierActor: true,
        published: new Date(),
      },

      {
        comment: "Accepted by supplier",
        deliveryDate: new Date("2026-04-20"),
        status: "accepted" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "accepted" },
        ],
        paymentHistory: [],
        items: [
          { name: "Бургер з яловичини", qty: 25 },
          { name: "Картопля фрі", qty: 40 },
        ],
        schoolActor: true,
        supplierActor: true,
        published: new Date(),
      },

      {
        comment: "In progress - being prepared",
        deliveryDate: new Date("2026-03-10"),
        status: "in_progress" as OrderStatus,
        payment: "verified" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "in_progress" },
        ],
        paymentHistory: [
          { from: "unpaid", to: "paid" },
          { from: "paid", to: "verified" },
        ],
        items: [{ name: "Апельсиновий сік", qty: 60 }],
        schoolActor: true,
        supplierActor: true,
        published: new Date(),
      },

      {
        comment: "In progress - being prepared",
        deliveryDate: new Date("2026-03-20"),
        status: "in_progress" as OrderStatus,
        payment: "verified" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "in_progress" },
        ],
        paymentHistory: [
          { from: "unpaid", to: "paid" },
          { from: "paid", to: "verified" },
        ],
        items: [{ name: "Апельсиновий сік", qty: 60 }],
        schoolActor: true,
        supplierActor: true,
        published: new Date(),
      },

      {
        comment: "Completed & delivered",
        deliveryDate: new Date("2026-02-10"),
        status: "completed" as OrderStatus,
        payment: "verified" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "in_progress" },
          { from: "in_progress", to: "completed" },
        ],
        paymentHistory: [
          { from: "unpaid", to: "paid" },
          { from: "paid", to: "verified" },
        ],
        items: [{ name: "Шоколадний брауні", qty: 30 }],
        schoolActor: true,
        supplierActor: true,
        published: new Date(),
      },

      {
        comment: "Completed & delivered",
        deliveryDate: new Date("2026-02-20"),
        status: "completed" as OrderStatus,
        payment: "verified" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "in_progress" },
          { from: "in_progress", to: "completed" },
        ],
        paymentHistory: [
          { from: "unpaid", to: "paid" },
          { from: "paid", to: "verified" },
        ],
        items: [{ name: "Шоколадний брауні", qty: 30 }],
        schoolActor: true,
        supplierActor: true,
        published: new Date(),
      },

      {
        comment: "Cancelled by school - no longer needed",
        deliveryDate: new Date("2026-01-10"),
        status: "cancelled" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "cancelled" },
        ],
        paymentHistory: [],
        items: [{ name: "Салат з овочів", qty: 10 }],
        schoolActor: true,
        supplierActor: false,
        published: new Date(),
      },

      {
        comment: "Cancelled by school - no longer needed",
        deliveryDate: new Date("2026-01-20"),
        status: "cancelled" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "cancelled" },
        ],
        paymentHistory: [],
        items: [{ name: "Салат з овочів", qty: 10 }],
        schoolActor: true,
        supplierActor: false,
        published: new Date(),
      },

      {
        comment: "Cancelled by supplier - out of stock",
        deliveryDate: new Date("2025-12-10"),
        status: "cancelled" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "cancelled" },
        ],
        paymentHistory: [],
        items: [{ name: "Картопляне пюре", qty: 18 }],
        schoolActor: true,
        supplierActor: true,
        published: new Date(),
      },

      {
        comment: "Cancelled by supplier - out of stock",
        deliveryDate: new Date("2025-12-20"),
        status: "cancelled" as OrderStatus,
        payment: "unpaid" as PaymentStatus,
        orderHistory: [
          { from: "draft", to: "published" },
          { from: "published", to: "accepted" },
          { from: "accepted", to: "cancelled" },
        ],
        paymentHistory: [],
        items: [{ name: "Картопляне пюре", qty: 18 }],
        schoolActor: true,
        supplierActor: true,
        published: new Date(),
      },
    ];

    for (const ord of additionalOrders) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            schoolId: school.id,
            supplierId:
              ord.status === "draft" || ord.status === "published"
                ? null
                : supplier.id,
            deliveryDate: ord.deliveryDate,
            orderStatus: ord.status,
            paymentStatus: ord.payment,
            totalPrice: 0,
            comment: ord.comment,
            publishedAt: ord.published,
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

        for (const h of ord.orderHistory) {
          let actorId: string | undefined;

          if (
            h.to === "published" ||
            (h.to === "cancelled" && h.from === "published") ||
            h.to === "completed"
          ) {
            actorId = schoolUser.id;
          } else if (
            h.to === "accepted" ||
            h.to === "in_progress" ||
            (h.to === "cancelled" && h.from === "accepted")
          ) {
            actorId = supplierUser.id;
          }

          if (actorId) {
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                previousStatus: h.from as OrderStatus,
                newStatus: h.to as OrderStatus,
                actorId,
              },
            });
          }
        }

        for (const h of ord.paymentHistory) {
          let actorId: string | undefined;

          if (h.to === "paid") {
            actorId = schoolUser.id;
          } else if (h.to === "verified") {
            actorId = supplierUser.id;
          }

          if (actorId) {
            await tx.orderPaymentHistory.create({
              data: {
                orderId: order.id,
                previousStatus: h.from as PaymentStatus,
                newStatus: h.to as PaymentStatus,
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
