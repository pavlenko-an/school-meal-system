import { redirect } from "next/navigation";
import { createOrder } from "@/features/order/api/actions";

export default async function CreateOrderPage() {
  const result = await createOrder();
  if (result.success && result.data) {
    redirect(`/school/orders/${result.data.id}/edit`);
  } else if (!result.success) {
    redirect("/school/dashboard?error=" + encodeURIComponent(result.error));
  }
}
