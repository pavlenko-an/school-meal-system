import { Role } from "@/generated/prisma/enums";
import { organizations } from "./organizations";

export const users = [
  {
    email: "admin@example.com",
    password: "Admin123",
    firstName: "Admin",
    lastName: "User",
    role: Role.admin,
    organizationId: null,
    avatarUrl: null,
  },
  {
    email: "sarah.greenwood@example.com",
    password: "Password123",
    firstName: "Sarah",
    lastName: "Johnson",
    role: Role.employee,
    organizationId: organizations[0].id,
    avatarUrl: null,
  },
  {
    email: "michael.hollywood@example.com",
    password: "Password123",
    firstName: "Michael",
    lastName: "Davis",
    role: Role.employee,
    organizationId: organizations[2].id,
    avatarUrl: null,
  },
];
