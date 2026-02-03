import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  createOrganizationInput,
  deleteOrganizationInput,
  getAllOrganizationsInput,
  getOrganizationByIdInput,
  updateOrganizationInput,
} from "./types";

export const OrganizationService = {
  async getAll(data: getAllOrganizationsInput) {
    const page = data.page && data.page > 0 ? data.page : 1;
    const limit = data.limit && data.limit > 0 ? data.limit : 10;
    const skip = (page - 1) * limit;
    const filters: Prisma.OrganizationWhereInput[] = [];
    if (data.name) {
      filters.push({ name: { contains: data.name, mode: "insensitive" } });
    }
    if (data.type) {
      filters.push({ type: data.type });
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

  async getById(data: getOrganizationByIdInput) {
    const organization = await prisma.organization.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        name: true,
        type: true,
        contactEmail: true,
        contactPhone: true,
      },
    });
    if (!organization) {
      throw new Error("Організація не знайдена");
    }
    return organization;
  },

  async create(data: createOrganizationInput) {
    const [existingName, existingEmail, existingPhone] = await Promise.all([
      prisma.organization.findUnique({
        where: { name: data.name },
      }),
      prisma.organization.findUnique({
        where: { contactEmail: data.contactEmail || undefined },
      }),
      prisma.organization.findUnique({
        where: { contactPhone: data.contactPhone || undefined },
      }),
    ]);

    if (existingName) {
      throw new Error("Назва організації вже використовується");
    }
    if (existingEmail) {
      throw new Error("Електронна пошта вже використовується");
    }
    if (existingPhone) {
      throw new Error("Телефонний номер вже використовується");
    }

    return await prisma.organization.create({
      data: {
        name: data.name,
        type: data.type,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        contactEmail: true,
        contactPhone: true,
      },
    });
  },

  async update(data: updateOrganizationInput) {
    const organization = await prisma.organization.findUnique({
      where: { id: data.id },
    });
    if (!organization) {
      throw new Error("Організація не знайдена");
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      const existingName = await prisma.organization.findUnique({
        where: { name: data.name },
      });
      if (existingName && existingName.id !== data.id) {
        throw new Error("Назва організації вже використовується");
      }
      updateData.name = data.name;
    }
    if (data.contactEmail !== undefined) {
      if (data.contactEmail !== null) {
        const existingOrg = await prisma.organization.findUnique({
          where: { contactEmail: data.contactEmail },
        });
        if (existingOrg && existingOrg.id !== data.id) {
          throw new Error("Електронна пошта вже використовується");
        }
      }
      updateData.contactEmail = data.contactEmail || null;
    }
    if (data.contactPhone !== undefined) {
      if (data.contactPhone !== null) {
        const existingOrg = await prisma.organization.findUnique({
          where: { contactPhone: data.contactPhone },
        });
        if (existingOrg && existingOrg.id !== data.id) {
          throw new Error("Телефонний номер вже використовується");
        }
      }
      updateData.contactPhone = data.contactPhone || null;
    }

    return await prisma.organization.update({
      where: { id: data.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        type: true,
        contactEmail: true,
        contactPhone: true,
      },
    });
  },

  async delete(data: deleteOrganizationInput) {
    const organization = await prisma.organization.findUnique({
      where: { id: data.id },
    });
    if (!organization)
      return {
        success: false,
        error: "Організація не знайдена",
      };
    await prisma.organization.delete({
      where: { id: data.id },
    });
  },
};
