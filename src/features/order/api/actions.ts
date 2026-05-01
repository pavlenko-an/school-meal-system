"use server";

import { getCurrentUser } from "@/shared/auth/current-user";
import { ActionResult } from "@/shared/types/action-result";
import {
  deleteOrderInput,
  OrderInfo,
  updateOrderInput,
  updateOrderStatusInput,
  updatePaymentStatusInput,
} from "../model/types";
import { OrderService } from "../model/services";
import {
  deleteOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "../model/input.schemas";
import z from "zod";
import { revalidateTag, updateTag } from "next/cache";

export async function createOrder(
  prevState: ActionResult<OrderInfo> | null = null,
): Promise<ActionResult<OrderInfo>> {
  try {
    const currentUser = await getCurrentUser();
    const order = await OrderService.create(currentUser);
    updateTag(`org-stats-${currentUser.organizationId}`);
    updateTag(`org-orders-${currentUser.organizationId}`);
    revalidateTag("org-overview", "max");
    revalidateTag("all-orders-stats", "max");
    return { success: true, data: order };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося створити замовлення",
    };
  }
}

export async function updateOrder(
  prevState: ActionResult<OrderInfo> | null = null,
  formData: FormData | updateOrderInput,
): Promise<ActionResult<OrderInfo>> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = updateOrderSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const order = await OrderService.update(result.data, currentUser);
    updateTag(`org-stats-${currentUser.organizationId}`);
    updateTag(`org-orders-${currentUser.organizationId}`);
    revalidateTag("org-overview", "max");
    revalidateTag("all-orders-stats", "max");
    return { success: true, data: order };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити замовлення",
    };
  }
}

export async function updateOrderStatus(
  prevState: ActionResult<OrderInfo> | null = null,
  formData: FormData | updateOrderStatusInput,
): Promise<ActionResult<OrderInfo>> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = updateOrderStatusSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const order = await OrderService.updateOrderStatus(
      result.data,
      currentUser,
    );
    updateTag(`org-stats-${currentUser.organizationId}`);
    updateTag(`org-orders-${currentUser.organizationId}`);
    revalidateTag("org-overview", "max");
    revalidateTag("all-orders-stats", "max");
    revalidateTag("published-orders", "max");
    console.log("Order status updated:", order);
    return { 
      success: true,
      data: order,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити статус замовлення",
    };
  }
}

export async function updatePaymentStatus(
  prevState: ActionResult<OrderInfo> | null = null,
  formData: FormData | updatePaymentStatusInput,
): Promise<ActionResult<OrderInfo>> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = updatePaymentStatusSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const order = await OrderService.updatePaymentStatus(
      result.data,
      currentUser,
    );
    updateTag(`org-stats-${currentUser.organizationId}`);
    updateTag(`org-orders-${currentUser.organizationId}`);
    revalidateTag("org-overview", "max");
    revalidateTag("all-orders-stats", "max");
    return {
      success: true,
      data: order,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити статус замовлення",
    };
  }
}

export async function deleteOrder(
  prevState: ActionResult<void> | null = null,
  formData: FormData | deleteOrderInput,
): Promise<ActionResult<void>> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = deleteOrderSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    await OrderService.delete(result.data, currentUser);
    updateTag(`org-stats-${currentUser.organizationId}`);
    updateTag(`org-orders-${currentUser.organizationId}`);
    revalidateTag("org-overview", "max");
    revalidateTag("all-orders-stats", "max");
    return { success: true, message: "Замовлення успішно видалено" };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити замовлення",
    };
  }
}
