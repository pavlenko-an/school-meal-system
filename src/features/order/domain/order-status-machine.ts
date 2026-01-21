import { OrderStatus } from "@/generated/prisma/enums";

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
  isSchool: boolean,
  isSupplier: boolean,
  paymentStatus: "unpaid" | "paid" | "verified",
): { allowed: boolean; reason?: string; newSupplierId?: string } {
  let allowed = false;
  let reason = "";
  let newSupplierId: string | undefined;

  switch (from) {
    case "new":
      if (to === "published" && isSchool) allowed = true;
      else reason = "From 'new' only → published by school";
      break;

    case "published":
      if (to === "accepted" && isSupplier) {
        allowed = true;
        newSupplierId = isSupplier ? undefined : newSupplierId;
      } else if (to === "cancelled" && isSchool) allowed = true;
      else
        reason =
          "From 'published': 'accepted' only by supplier, 'cancelled' only by school";
      break;

    case "accepted":
      if (to === "in_progress" && isSupplier && paymentStatus === "verified")
        allowed = true;
      else if (to === "cancelled" && isSupplier && paymentStatus === "unpaid")
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
