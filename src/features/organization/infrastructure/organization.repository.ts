import { prisma } from "@/shared/db/prisma";

export class OrganizationRepository {
  async findById(id: string) {
    const organization = await prisma.organization.findUnique({
      where: { id },
    });
    return organization;
  }
}
