import { OrgType } from "@/generated/prisma/enums";

export const organizations = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Greenwood High School",
    type: OrgType.school,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
    name: "Global Supplies Inc.",
    type: OrgType.supplier,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    name: "Hollywood Elementary School",
    type: OrgType.school,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
