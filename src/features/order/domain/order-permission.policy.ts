import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { CurrentUser } from "@/shared/auth/current-user";
import { Order } from "@/generated/prisma/client";

export class OrderPermissionPolicy {
  static canViewAllOrders(user: CurrentUser) {
    if (user.role !== "admin") {
      throw new AccessDeniedError("Access denied");
    }
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
      throw new AccessDeniedError("Access denied");
    }
  }

  static canViewOrganizationData(user: CurrentUser) {
    if (
      user.role !== "employee" ||
      !user.organizationId ||
      !user.organizationType
    ) {
      throw new AccessDeniedError("Access denied");
    }
  }

  static canCreateOrder(user: CurrentUser) {
    if (
      user.role !== "employee" ||
      user.organizationType !== "school" ||
      !user.organizationId
    ) {
      throw new AccessDeniedError("Access denied");
    }
  }

  static canUpdateOrder(user: CurrentUser, order: Order) {
    if (
      user.role !== "employee" ||
      user.organizationType !== "school" ||
      user.organizationId !== order.schoolId
    ) {
      throw new AccessDeniedError("Access denied");
    }
  }

  static canChangeStatus(user: CurrentUser, order: Order) {
    if (user.role !== "employee") {
      throw new AccessDeniedError("Only employees can change order status");
    }
    const isSchool =
      user.organizationType === "school" &&
      user.organizationId === order.schoolId;
    const isSupplier =
      user.organizationType === "supplier" &&
      user.organizationId === order.supplierId;
    if (!isSchool && !isSupplier) {
      throw new AccessDeniedError("You are not a participant of this order");
    }
    return { isSchool, isSupplier };
  }

  static canDeleteOrder(user: CurrentUser, order: Order) {
    if (
      user.role !== "employee" ||
      user.organizationType !== "school" ||
      user.organizationId !== order.schoolId
    ) {
      throw new AccessDeniedError("Access denied");
    }
  }
}
