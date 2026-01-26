import { redirect } from "next/navigation";
import OrderEditForm from "@/features/order/ui/OrderEditForm";
import { getOrderById } from "@/features/order/queries/get-order-by-id.query";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getAllMenuItems } from "@/features/menu-item/queries/get-all-menu-items.query";
import { getAllOrderItems } from "@/features/order-item/queries/get-all-order-items.query";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new UnauthorizedError("Unauthorized");
  }
  const order = await getOrderById({ id }, currentUser);
  if (order.orderStatus !== "new") {
    redirect(`/school/orders/${id}`);
  }
  const orderItems = await getAllOrderItems({ orderId: id });
  const menuItems = await getAllMenuItems({});
  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Редагування замовлення #{id.slice(0, 8)}
      </h1>

      <OrderEditForm
        orderId={id}
        initialOrder={order}
        initialItems={orderItems ?? []}
        menuItems={menuItems}
      />
    </div>
  );
}
