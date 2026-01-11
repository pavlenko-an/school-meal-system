import { prisma } from "@/shared/db/prisma";
import {
  createOrganizationInput,
  deleteOrganizationInput,
  getAllOrganizationsInput,
  getOrganizationByIdInput,
  updateOrganizationInput,
} from "../model/organization.types";
import { CurrentUser } from "@/shared/auth/current-user";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { ConflictError } from "@/shared/errors/conflict.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

export async function getAllOrganizations(data: getAllOrganizationsInput) {
  const organizations = await prisma.organization.findMany({
    where: {
      AND: [
        data.name
          ? { name: { contains: data.name, mode: "insensitive" } }
          : undefined,
        data.type ? { type: data.type } : undefined,
      ].filter(Boolean) as any[],
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return organizations;
}

export async function getOrganizationById(data: getOrganizationByIdInput) {
  const organization = await prisma.organization.findUnique({
    where: { id: data.id },
  });
  return organization;
}

export async function getCurrentOrganization(currentUser: CurrentUser) {
  const organization = await prisma.organization.findUnique({
    where: { id: currentUser.organizationId || undefined },
  });
  return organization;
}

export async function createOrganization(
  data: createOrganizationInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }

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
    throw new ConflictError("Organization name already in use");
  }
  if (existingEmail) {
    throw new ConflictError("Contact email already in use");
  }
  if (existingPhone) {
    throw new ConflictError("Contact phone already in use");
  }

  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      type: data.type,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
    },
  });
  return organization;
}

export async function updateOrganization(
  data: updateOrganizationInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin" && currentUser.organizationId !== data.id) {
    throw new AccessDeniedError("Access denied");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: data.id },
  });
  if (!organization) throw new NotFoundError("Organization not found");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) {
    const existingName = await prisma.organization.findUnique({
      where: { name: data.name },
    });
    if (existingName && existingName.id !== data.id) {
      throw new ConflictError("Organization name already in use");
    }
    updateData.name = data.name;
  }
  if (data.type !== undefined) {
    if (currentUser.role !== "admin") {
      throw new AccessDeniedError("Access denied");
    }
    updateData.type = data.type;
  }

  if (data.contactEmail !== undefined) {
    if (data.contactEmail !== null) {
      const existingOrg = await prisma.organization.findUnique({
        where: { contactEmail: data.contactEmail },
      });
      if (existingOrg && existingOrg.id !== data.id) {
        throw new ConflictError("Contact email already in use");
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
        throw new ConflictError("Contact phone already in use");
      }
    }
    updateData.contactPhone = data.contactPhone || null;
  }

  const updatedOrganization = await prisma.organization.update({
    where: { id: data.id },
    data: updateData,
  });
  return updatedOrganization;
}

export async function deleteOrganization(
  data: deleteOrganizationInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const organization = await prisma.organization.findUnique({
    where: { id: data.id },
  });
  if (!organization) throw new NotFoundError("Organization not found");
  await prisma.organization.delete({
    where: { id: data.id },
  });
}
