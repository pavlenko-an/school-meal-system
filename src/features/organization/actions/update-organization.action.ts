"use server";

import { prisma } from "@/shared/db/prisma";
import {
  OrganizationInfo,
  updateOrganizationInput,
} from "../model/organization.types";
import { getCurrentUser } from "@/shared/auth/current-user";
import { updateOrganizationSchema } from "../model/update-organization.schema";

type ActionResult =
  | { success: true; data: OrganizationInfo }
  | { success: false; error: string };

export async function updateOrganization(
  prevState: ActionResult | null = null,
  formData: FormData | updateOrganizationInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin" && !currentUser.organizationId) {
      return {
        success: false,
        error: "Відмовлено в доступі",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = updateOrganizationSchema.parse(rawData);
    const organizationId = data.id ?? currentUser.organizationId;
    if (!organizationId) {
      return {
        success: false,
        error: "ID організації не вказано",
      };
    }

    if (
      currentUser.role !== "admin" &&
      currentUser.organizationId !== organizationId
    ) {
      return {
        success: false,
        error: "Відмовлено в доступі",
      };
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      return {
        success: false,
        error: "Організація не знайдена",
      };
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      const existingName = await prisma.organization.findUnique({
        where: { name: data.name },
      });
      if (existingName && existingName.id !== organizationId) {
        return {
          success: false,
          error: "Назва організації вже використовується",
        };
      }
      updateData.name = data.name;
    }
    if (data.type !== undefined) {
      if (currentUser.role !== "admin") {
        return {
          success: false,
          error: "Відмовлено в доступі",
        };
      }
      updateData.type = data.type;
    }

    if (data.contactEmail !== undefined) {
      if (data.contactEmail !== null) {
        const existingOrg = await prisma.organization.findUnique({
          where: { contactEmail: data.contactEmail },
        });
        if (existingOrg && existingOrg.id !== organizationId) {
          return {
            success: false,
            error: "Електронна пошта вже використовується",
          };
        }
      }
      updateData.contactEmail = data.contactEmail || null;
    }
    if (data.contactPhone !== undefined) {
      if (data.contactPhone !== null) {
        const existingOrg = await prisma.organization.findUnique({
          where: { contactPhone: data.contactPhone },
        });
        if (existingOrg && existingOrg.id !== organizationId) {
          return {
            success: false,
            error: "Телефонний номер вже використовується",
          };
        }
      }
      updateData.contactPhone = data.contactPhone || null;
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
      select: {
        id: true,
        name: true,
        type: true,
        contactEmail: true,
        contactPhone: true,
      },
    });
    return { success: true, data: updatedOrganization };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити організацію",
    };
  }
}
