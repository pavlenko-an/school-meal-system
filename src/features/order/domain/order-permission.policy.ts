import { CurrentUser } from "@/shared/auth/current-user";
import { Order } from "@/generated/prisma/client";

export class OrderPermissionPolicy {
  static canViewAllOrders(user: CurrentUser) {
    if (user.role !== "admin") {
      return {
        allowed: false,
        reason: "Відмовлено в доступі",
      };
    }
    return { allowed: true };
  }

  static canViewOrderById(user: CurrentUser, order: Order) {
    const isSchoolMember =
      user.organizationType === "school" &&
      order.schoolId === user.organizationId;
    const isSupplierMember =
      user.organizationType === "supplier" &&
      order.supplierId === user.organizationId;
    const isAdmin = user.role === "admin";
    if (!isSchoolMember && !isSupplierMember && !isAdmin) {
      return {
        allowed: false,
        reason: "Відмовлено в доступі",
      };
    }
    return { allowed: true };
  }

  static canViewOrganizationData(user: CurrentUser) {
    if (
      user.role !== "employee" ||
      !user.organizationId ||
      !user.organizationType
    ) {
      return {
        allowed: false,
        reason: "Ви не маєте права переглядати ці дані",
      };
    }
    return { allowed: true };
  }

  static canCreateOrder(user: CurrentUser) {
    if (
      user.role !== "employee" ||
      user.organizationType !== "school" ||
      !user.organizationId
    ) {
      return {
        allowed: false,
        reason: "Відмовлено в доступі",
      };
    }
    return { allowed: true };
  }

  static canUpdateOrder(user: CurrentUser) {
    if (
      user.role !== "employee" ||
      user.organizationType !== "school" ||
      !user.organizationId
    ) {
      return {
        allowed: false,
        reason: "Відмовлено в доступі",
      };
    }
    return { allowed: true };
  }

  static canChangeStatus(
    user: CurrentUser,
    order: Order,
  ):
    | { allowed: true; isSchool: boolean; isSupplier: boolean }
    | { allowed: false; reason: string } {
    if (user.role !== "employee") {
      return {
        allowed: false,
        reason: "Тільки працівники можуть змінювати статус замовлення",
      };
    }
    const isSchool =
      user.organizationType === "school" &&
      user.organizationId === order.schoolId;
    const isSupplier =
      user.organizationType === "supplier" &&
      user.organizationId === order.supplierId;
    if (!isSchool && !isSupplier) {
      return {
        allowed: false,
        reason: "Ви не маєте права змінювати статус цього замовлення",
      };
    }

    return { allowed: true, isSchool, isSupplier };
  }

  static canDeleteOrder(user: CurrentUser, order: Order) {
    if (
      user.role !== "employee" ||
      user.organizationType !== "school" ||
      user.organizationId !== order.schoolId
    ) {
      return {
        allowed: false,
        reason: "Відмовлено в доступі",
      };
    }
    return { allowed: true };
  }
}
