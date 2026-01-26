"use server";

import { prisma } from "@/shared/db/prisma";
import {
  createOrganizationInput,
  OrganizationInfo,
} from "../model/organization.types";
import { getCurrentUser } from "@/shared/auth/current-user";
import { createOrganizationSchema } from "../model/create-organization.schema";

type ActionResult =
  | { success: true; data: OrganizationInfo }
  | { success: false; error: string };

export async function createOrganization(
  prevState: ActionResult | null = null,
  formData: FormData | createOrganizationInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Відмовлено в доступі",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = createOrganizationSchema.parse(rawData);

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
      return {
        success: false,
        error: "Назва організації вже використовується",
      };
    }
    if (existingEmail) {
      return {
        success: false,
        error: "Електронна пошта вже використовується",
      };
    }
    if (existingPhone) {
      return {
        success: false,
        error: "Телефонний номер вже використовується",
      };
    }

    const organization = await prisma.organization.create({
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
    return { success: true, data: organization };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося створити організацію",
    };
  }
}
