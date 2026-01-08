import bcrypt from "bcryptjs";
import { organizations } from "./seeds/organizations";
import { users } from "./seeds/users";
import { prisma } from "@/shared/db/prisma";
import { categories } from "./seeds/categories";
import { menuItems } from "./seeds/menu-items";

async function main() {
  console.log("Clearing database...");

  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log("Database cleared successfully.");
  console.log("Seeding database...");

  for (const org of organizations) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: {
        name: org.name,
        type: org.type,
        updatedAt: new Date(),
      },
      create: org,
    });
  }

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: hashedPassword,
        role: u.role,
        updatedAt: new Date(),
      },
      create: {
        email: u.email,
        passwordHash: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        organizationId: organizations[0].id,
      },
    });
  }

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
      },
      create: {
        name: cat.name,
        description: cat.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  for (const item of menuItems) {
    const category = await prisma.category.findUnique({
      where: { name: item.categoryName },
    });

    if (!category) {
      console.warn(
        `Category "${item.categoryName}" not found, skipping item "${item.name}"`
      );
      continue;
    }

    await prisma.menuItem.upsert({
      where: { name: item.name },
      update: {
        description: item.description,
        price: item.price,
        categoryId: category.id,
        isAvailable: true,
      },
      create: {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: category.id,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log("Database seeded successfully!");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
