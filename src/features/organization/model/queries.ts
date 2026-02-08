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
import { unstable_cache } from "next/cache";

export async function getAllOrganizations(
  data: getAllOrganizationsInput,
): Promise<OrganizationsList> {
  const validated = getAllOrganizationsSchema.parse(data);

  const cacheKeyParts = [
    "all-orgs",
    validated.name || "no-name",
    validated.type || "no-type",
    validated.page ? String(validated.page) : "1",
    validated.limit ? String(validated.limit) : "10",
  ];

  return unstable_cache(
    async () => {
      console.log(
        `[CACHE MISS/HIT CHECK] ${new Date().toISOString()} — выполняю реальные запросы к БД`,
      );

      const page = validated.page && validated.page > 0 ? validated.page : 1;
      const limit =
        validated.limit && validated.limit > 0 ? validated.limit : 10;
      const skip = (page - 1) * limit;
      const filters: Prisma.OrganizationWhereInput[] = [];
      if (validated.name) {
        filters.push({
          name: { contains: validated.name, mode: "insensitive" },
        });
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
    },
    cacheKeyParts,
    {
      revalidate: 300,
      tags: ["all-orgs"],
    },
  )();
}

export async function getOrganizationsOverview(limit = 5) {
  return unstable_cache(
    async () => {
      console.log(
        `[CACHE MISS/HIT CHECK] ${new Date().toISOString()} — выполняю реальные запросы к БД`,
      );

      const [total, schools, suppliers] = await Promise.all([
        prisma.organization.count(),
        prisma.organization.count({ where: { type: "school" } }),
        prisma.organization.count({ where: { type: "supplier" } }),
      ]);

      const stats = {
        total,
        schools,
        suppliers,
      };

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

      const topSchools = schoolsWithOrders.map((school) => ({
        name: school.name,
        orderCount: school._count.schoolOrders,
        totalValue: school.schoolOrders.reduce(
          (sum, o) => sum + Number(o.totalPrice),
          0,
        ),
      }));

      const suppliersWithOrders = await prisma.organization.findMany({
        where: { type: "supplier" },
        select: {
          id: true,
          name: true,
          _count: {
            select: { supplierOrders: true },
          },
          supplierOrders: {
            select: { totalPrice: true },
          },
        },
        orderBy: {
          supplierOrders: {
            _count: "desc",
          },
        },
        take: limit,
      });

      const topSuppliers = suppliersWithOrders.map((supplier) => ({
        name: supplier.name,
        orderCount: supplier._count.supplierOrders,
        totalValue: supplier.supplierOrders.reduce(
          (sum, o) => sum + Number(o.totalPrice),
          0,
        ),
      }));

      return {
        stats,
        topSchools,
        topSuppliers,
      };
    },
    ["org-overview", String(limit)],
    {
      revalidate: 300,
      tags: ["org-overview"],
    },
  )();
}

export async function getOrganizationById(data: getOrganizationByIdInput) {
  const validated = getOrganizationByIdSchema.parse(data);
  const organization = await prisma.organization.findUnique({
    where: { id: validated.id },
  });
  return organization;
}
