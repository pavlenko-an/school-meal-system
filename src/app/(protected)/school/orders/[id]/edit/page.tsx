import { redirect } from "next/navigation";
import OrderEditForm from "@/features/order/ui/OrderEditForm";
import { getCurrentUser } from "@/shared/auth/current-user";
import { getOrderById } from "@/features/order/model/queries";
import { getAllOrderItems } from "@/features/order-item/model/queries";
import { getAllMenuItems } from "@/features/menu-item/model/queries";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const order = await getOrderById({ id }, currentUser);
  if (order.orderStatus !== "draft") {
    redirect(`/school/orders/${id}`);
  }
  const orderItems = await getAllOrderItems({ orderId: id });
  const data = await getAllMenuItems({
    limit: 100,
    page: 1,
  });
  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Редагування замовлення #{id.slice(0, 8)}
      </h1>

      <OrderEditForm
        orderId={id}
        initialOrder={order}
        initialItems={orderItems ?? []}
        menuItems={data.items}
      />
    </div>
  );
}
