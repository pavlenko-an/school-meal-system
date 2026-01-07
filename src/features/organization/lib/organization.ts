import { prisma } from "@/shared/db/prisma";
import { createOrganizationSchema } from "../model/create-organization.schema";
import { deleteOrganizationSchema } from "../model/delete-organization.schema";
import { getAllOrganizationsSchema } from "../model/get-all-organizations.schema";
import { getOrganizationByIdSchema } from "../model/get-organization-by-id.schema";
import {
  createOrganizationInput,
  deleteOrganizationInput,
  getAllOrganizationsInput,
  getOrganizationByIdInput,
  updateOrganizationInput,
} from "../model/organization.types";
import { updateOrganizationSchema } from "../model/update-organization.schema";
import { CurrentUser } from "@/shared/auth/current-user";

export async function getAllOrganizations(input: getAllOrganizationsInput) {
  const data = getAllOrganizationsSchema.parse(input);
  const organizations = await prisma.organization.findMany({
    where: {
      AND: [
        data.type ? { type: data.type } : undefined,
        data.contactEmail ? { contactEmail: data.contactEmail } : undefined,
        data.contactPhone ? { contactPhone: data.contactPhone } : undefined,
      ].filter(Boolean) as any[],
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return organizations;
}

export async function getOrganizationById(input: getOrganizationByIdInput) {
  const data = getOrganizationByIdSchema.parse(input);
  const organization = await prisma.organization.findUnique({
    where: { id: data.id },
  });
  return organization;
}

export async function createOrganization(
  input: createOrganizationInput,
  currentUser: CurrentUser
) {
  const data = createOrganizationSchema.parse(input);

  if (currentUser.role !== "admin") {
    throw new Error("Access denied");
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
  input: updateOrganizationInput,
  currentUser: CurrentUser
) {
  const data = updateOrganizationSchema.parse(input);
  if (currentUser.role !== "admin" && currentUser.organizationId !== data.id) {
    throw new Error("Access denied");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: data.id },
  });
  if (!organization) throw new Error("Organization not found");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) {
    if (currentUser.role !== "admin") {
      throw new Error("Access denied");
    }
    updateData.type = data.type;
  }
  
  if (data.contactEmail !== undefined) {
    if (data.contactEmail !== null) {
      const existingOrg = await prisma.organization.findUnique({
        where: { contactEmail: data.contactEmail },
      });
      if (existingOrg && existingOrg.id !== data.id) {
        throw new Error("Contact email already in use");
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
        throw new Error("Contact phone already in use");
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
  input: deleteOrganizationInput,
  currentUser: CurrentUser
) {
  const data = deleteOrganizationSchema.parse(input);
  if (currentUser.role !== "admin") {
    throw new Error("Access denied");
  }
  const organization = await prisma.organization.findUnique({
    where: { id: data.id },
  });
  if (!organization) throw new Error("Organization not found");

  await prisma.organization.delete({
    where: { id: data.id },
  });
}
