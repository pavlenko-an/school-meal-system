import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth";
import { apiFetch } from "@/lib/api";
import OrderEditForm from "@/features/order/ui/OrderEditForm";

export default async function EditOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) redirect("/auth/login");

  let order, orderItems;

  try {
    order = await apiFetch(`/orders/${params.id}`);
    if (order.schoolId !== session.user.organizationId) {
      redirect("/school/orders?error=access-denied");
    }

    orderItems = await apiFetch(
      `/order-items?orderId=${params.id}&include=menuItem`,
    );
  } catch {
    notFound();
  }

  if (order.orderStatus !== "new") {
    redirect(`/school/orders/${params.id}`);
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Редагування замовлення #{params.id.slice(0, 8)}
      </h1>

      <OrderEditForm
        orderId={params.id}
        initialOrder={order}
        initialItems={orderItems}
        menuItems={await apiFetch(
          "/menu-items?include=images,category&isAvailable=true",
        )}
      />
    </div>
  );
}
