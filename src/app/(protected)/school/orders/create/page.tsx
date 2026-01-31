import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth";
import { createOrder } from "@/features/order/api/actions";

export default async function CreateOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    redirect("/auth/login");
  }
  const result = await createOrder();
  if (result.success && result.data) {
    redirect(`/school/orders/${result.data.id}/edit`);
  } else if (!result.success) {
    redirect("/school/dashboard?error=" + encodeURIComponent(result.error));
  }
}
