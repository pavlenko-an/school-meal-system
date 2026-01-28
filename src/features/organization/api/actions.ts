"use server";

import {
  createOrganizationInput,
  deleteOrganizationInput,
  OrganizationInfo,
  updateOrganizationInput,
} from "../model/types";
import { getCurrentUser } from "@/shared/auth/current-user";
import { ActionResult } from "@/shared/types/action-result";
import { OrganizationService } from "../model/services";
import {
  createOrganizationSchema,
  deleteOrganizationSchema,
  updateOrganizationSchema,
} from "../model/schemas";
import z from "zod";

export async function createOrganization(
  prevState: ActionResult<OrganizationInfo> | null = null,
  formData: FormData | createOrganizationInput,
): Promise<ActionResult<OrganizationInfo>> {
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
    const result = createOrganizationSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const organization = await OrganizationService.create(result.data);
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

export async function updateOrganization(
  prevState: ActionResult<OrganizationInfo> | null = null,
  formData: FormData | updateOrganizationInput,
): Promise<ActionResult<OrganizationInfo>> {
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
    const result = updateOrganizationSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const data = result.data;
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
    const updatedOrganization = await OrganizationService.update({
      id: organizationId,
      ...data,
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

export async function deleteOrganization(
  prevState: ActionResult<void> | null = null,
  formData: FormData | deleteOrganizationInput,
): Promise<ActionResult<void>> {
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
    const result = deleteOrganizationSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const data = result.data;
    const organizationId = data.id ?? currentUser.organizationId;
    if (!organizationId) {
      return {
        success: false,
        error: "ID організації не вказано",
      };
    }
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Відмовлено в доступі",
      };
    }
    await OrganizationService.delete({ id: organizationId });
    return { success: true, message: "Організацію успішно видалено" };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити організацію",
    };
  }
}
