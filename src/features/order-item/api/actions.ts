"use server";

import { ActionResult } from "@/shared/types/action-result";
import {
  createOrderItemSchema,
  deleteOrderItemSchema,
  updateOrderItemSchema,
} from "../model/schemas";
import { OrderItemService } from "../model/services";
import {
  createOrderItemInput,
  deleteOrderItemInput,
  OrderItemInfo,
  updateOrderItemInput,
} from "../model/types";
import { getCurrentUser } from "@/shared/auth/current-user";
import z from "zod";
import { revalidateTag, updateTag } from "next/cache";

export async function createOrderItem(
  prevState: ActionResult<OrderItemInfo> | null = null,
  formData: FormData | createOrderItemInput,
): Promise<ActionResult<OrderItemInfo>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "employee") {
      return {
        success: false,
        error: "Лишe працівники можуть створювати позиції замовлення",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = createOrderItemSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const orderItem = await OrderItemService.create(result.data);
    updateTag(`org-stats-${currentUser.organizationId}`);
    updateTag(`org-orders-${currentUser.organizationId}`);
    revalidateTag("org-overview", "max");
    revalidateTag("all-orders-stats", "max");
    return {
      success: true,
      data: orderItem,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося створити позицію замовлення",
    };
  }
}

export async function updateOrderItem(
  prevState: ActionResult<OrderItemInfo> | null = null,
  formData: FormData | updateOrderItemInput,
): Promise<ActionResult<OrderItemInfo>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "employee") {
      return {
        success: false,
        error: "Лишe працівники можуть оновлювати позиції замовлення",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = updateOrderItemSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const updatedOrderItem = await OrderItemService.update(result.data);
    updateTag(`org-stats-${currentUser.organizationId}`);
    updateTag(`org-orders-${currentUser.organizationId}`);
    revalidateTag("org-overview", "max");
    revalidateTag("all-orders-stats", "max");
    return {
      success: true,
      data: updatedOrderItem,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити позицію замовлення",
    };
  }
}

export async function deleteOrderItem(
  prevState: ActionResult<void> | null = null,
  formData: FormData | deleteOrderItemInput,
): Promise<ActionResult<void>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "employee") {
      return {
        success: false,
        error: "Лишe працівники можуть видаляти позиції замовлення",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = deleteOrderItemSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    await OrderItemService.delete(result.data);
    updateTag(`org-stats-${currentUser.organizationId}`);
    updateTag(`org-orders-${currentUser.organizationId}`);
    revalidateTag("org-overview", "max");
    revalidateTag("all-orders-stats", "max");
    return { success: true, message: "Позиція замовлення успішно видалена" };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити позицію замовлення",
    };
  }
}
