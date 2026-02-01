import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  getAllOrganizationsInput,
  getOrganizationByIdInput,
  OrganizationsList,
} from "../model/types";
import {
  getAllOrganizationsSchema,
  getOrganizationByIdSchema,
} from "./schemas";

export async function getAllOrganizations(
  data: getAllOrganizationsInput,
): Promise<OrganizationsList> {
  const validated = getAllOrganizationsSchema.parse(data);
  const page = validated.page && validated.page > 0 ? validated.page : 1;
  const limit = validated.limit && validated.limit > 0 ? validated.limit : 10;
  const skip = (page - 1) * limit;
  const filters: Prisma.OrganizationWhereInput[] = [];
  if (validated.name) {
    filters.push({ name: { contains: validated.name, mode: "insensitive" } });
  }
  if (validated.type) {
    filters.push({ type: validated.type });
  }
  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where: filters.length > 0 ? { AND: filters } : undefined,
      skip: skip,
      take: limit,
    }),
    prisma.organization.count({
      where: filters.length > 0 ? { AND: filters } : undefined,
    }),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    organizations,
    total,
    page,
    totalPages,
  };
}

export async function getAllOrganizationsStats() {
  const [total, schools, suppliers, withUsers, withoutUsers] =
    await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { type: "school" } }),
      prisma.organization.count({ where: { type: "supplier" } }),
      prisma.organization.count({
        where: { users: { some: {} } },
      }),
      prisma.organization.count({
        where: { users: { none: {} } },
      }),
    ]);

  return {
    total,
    schools,
    suppliers,
    withUsers,
    withoutUsers,
    schoolsPercentage: total > 0 ? Math.round((schools / total) * 100) : 0,
    suppliersPercentage: total > 0 ? Math.round((suppliers / total) * 100) : 0,
  };
}

export async function getTopSchoolsByOrderValue(limit = 5) {
  const schoolsWithOrders = await prisma.organization.findMany({
    where: { type: "school" },
    select: {
      id: true,
      name: true,
      _count: {
        select: { schoolOrders: true },
      },
      schoolOrders: {
        select: { totalPrice: true },
      },
    },
    orderBy: {
      schoolOrders: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return schoolsWithOrders.map((school) => ({
    name: school.name,
    orderCount: school._count.schoolOrders,
    totalValue: school.schoolOrders.reduce(
      (sum, o) => sum + Number(o.totalPrice),
      0,
    ),
  }));
}

export async function getOrganizationById(data: getOrganizationByIdInput) {
  const validated = getOrganizationByIdSchema.parse(data);
  const organization = await prisma.organization.findUnique({
    where: { id: validated.id },
  });
  return organization;
}
