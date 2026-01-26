import { prisma } from "@/shared/db/prisma";
import { getOrganizationByIdSchema } from "../model/get-organization-by-id.schema";
import { getOrganizationByIdInput } from "../model/organization.types";

export async function getOrganizationById(data: getOrganizationByIdInput) {
  const validated = getOrganizationByIdSchema.parse(data);
  const organization = await prisma.organization.findUnique({
    where: { id: validated.id },
  });
  return organization;
}
