import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

export function canTransitionPaymentStatus(
  currentPayment: PaymentStatus,
  targetPayment: PaymentStatus,
  isSchool: boolean,
  isSupplier: boolean,
  orderStatus: OrderStatus,
): { allowed: boolean; reason?: string } {
  let allowed = false;
  let reason = "";

  switch (currentPayment) {
    case "unpaid":
      if (targetPayment === "paid" && isSchool) {
        if (orderStatus !== "accepted") {
          reason = "Can only mark as paid when order is in 'accepted' status";
        } else {
          allowed = true;
        }
      } else {
        reason =
          "From 'unpaid' only 'paid' by school is allowed (and only in accepted)";
      }
      break;

    case "paid":
      if (targetPayment === "verified" && isSupplier) {
        if (orderStatus !== "accepted") {
          reason = "Can only verify payment when order is in 'accepted' status";
        } else {
          allowed = true;
        }
      } else {
        reason =
          "From 'paid' only 'verified' by supplier is allowed (and only in accepted)";
      }
      break;

    case "verified":
      reason = "Payment already verified — cannot change further";
      break;

    default:
      reason = "Unknown current payment status";
  }

  return { allowed, reason };
}
