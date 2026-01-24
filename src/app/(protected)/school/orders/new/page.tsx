import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth";
import { createOrder } from "@/features/order/actions/create-order.action";

export default async function NewOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    redirect("/auth/login");
  }
  const result = await createOrder();
  console.log("Create order result:", result);
  if (!result.success) {
    redirect("/school/dashboard?error=" + encodeURIComponent(result.error));
  }
  redirect(`/school/orders/${result.order.id}/edit`);
}
