import { getAllOrderItems } from "@/features/order-item/model/queries";
import { OrderItemInfo } from "@/features/order-item/model/types";
import { OrderItemsTable } from "@/features/order-item/ui/OrderItemsTable";
import { getOrderById, getOrderHistory } from "@/features/order/model/queries";
import { OrderHistory, OrderInfo } from "@/features/order/model/types";
import { SchoolOrderDetailsCard } from "@/features/order/ui/SchoolOrderDetailsCard";
import StatusHistory from "@/features/order/ui/StatusHistory";
import { getCurrentUser } from "@/shared/auth/current-user";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SchoolOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const order: OrderInfo = await getOrderById({ id }, currentUser);
  const orderItems: OrderItemInfo[] = await getAllOrderItems({ orderId: id });
  const statusHistory: OrderHistory[] = await getOrderHistory(
    { id },
    currentUser,
  );

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Замовлення #{id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground mt-2">
            Створено: {new Date(order.createdAt).toLocaleString("uk-UA")}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <SchoolOrderDetailsCard order={order} />
        <OrderItemsTable items={orderItems} />
        <StatusHistory history={statusHistory} />
      </div>
    </div>
  );
}
