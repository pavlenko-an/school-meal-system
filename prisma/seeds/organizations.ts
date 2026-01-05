import { OrgType } from "@/generated/prisma/enums";

export const organizations = [
  {
    id: "00000000-0000-0000-0000-000000000000",
    name: "Demo School",
    type: OrgType.school,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Demo Supplier",
    type: OrgType.supplier,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
