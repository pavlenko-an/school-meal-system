import { Order } from "@/generated/prisma/client";
import { OrderStatus } from "@/generated/prisma/enums";

export function canTransitionOrderStatus(
  order: Order & { orderItems: { id: string }[] },
  to: OrderStatus,
  isSchool: boolean,
  isSupplier: boolean,
  supplierId?: string,
): { allowed: boolean; reason?: string; newSupplierId?: string } {
  let allowed = false;
  let reason = "";
  let newSupplierId: string | undefined;

  switch (order.orderStatus) {
    case "draft":
      if (to === "published" && isSchool) {
        if (order.orderItems.length === 0) {
          reason = "Замовлення порожнє — додайте хоча б один товар";
          break;
        }
        if (!order.deliveryDate) {
          reason = "Вкажіть дату доставки";
          break;
        }
        if (order.deliveryDate <= new Date()) {
          reason = "Дата доставки повинна бути в майбутньому";
          break;
        }
        allowed = true;
      } else reason = "From 'draft' only → published by school";
      break;

    case "published":
      if (to === "accepted" && isSupplier) {
        allowed = true;
        newSupplierId = supplierId;
      } else if (to === "cancelled" && isSchool) allowed = true;
      else
        reason =
          "From 'published': 'accepted' only by supplier, 'cancelled' only by school";
      break;

    case "accepted":
      if (
        to === "in_progress" &&
        isSupplier &&
        order.paymentStatus === "verified"
      )
        allowed = true;
      else if (
        to === "cancelled" &&
        isSupplier &&
        order.paymentStatus === "unpaid"
      )
        allowed = true;
      else
        reason =
          "From 'accepted' only → in_progress (verified) or cancelled (unpaid) by supplier";
      break;

    case "in_progress":
      if (to === "completed" && isSchool) allowed = true;
      else reason = "From 'in_progress' only → completed by school";
      break;

    case "completed":
    case "cancelled":
      reason = "Final status — cannot be changed";
      break;

    default:
      reason = "Unknown current status";
  }

  return { allowed, reason, newSupplierId };
}
