import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth";
import { apiFetch } from "@/lib/api";

export default async function NewOrderRedirect() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    redirect("/school/dashboard");
  }

  try {
    const newOrder = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      }),
    });

    redirect(`/school/orders/${newOrder.id}/edit`);
  } catch (err) {
    console.error("Не вдалося створити замовлення", err);
    redirect("/school/dashboard?error=create_failed");
  }
}
