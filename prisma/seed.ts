import bcrypt from "bcryptjs";
import { organizations } from "./seeds/organizations";
import { users } from "./seeds/users";
import { prisma } from "@/shared/db/prisma";

async function main() {
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
