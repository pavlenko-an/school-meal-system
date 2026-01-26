import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getAllOrganizationsInput } from "../model/organization.types";
import { getAllOrganizationsSchema } from "../model/get-all-organizations.schema";

export async function getAllOrganizations(data: getAllOrganizationsInput) {
  const validated = getAllOrganizationsSchema.parse(data);
  const filters: Prisma.OrganizationWhereInput[] = [];
  if (validated.name) {
    filters.push({ name: { contains: validated.name, mode: "insensitive" } });
  }
  if (validated.type) {
    filters.push({ type: validated.type });
  }
  const organizations = await prisma.organization.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    take: validated.limit ?? 20,
    skip: validated.offset ?? 0,
  });
  return organizations;
}
