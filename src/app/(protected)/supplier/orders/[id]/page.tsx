import { getAllOrderItems } from "@/features/order-item/model/queries";
import { OrderItemInfo } from "@/features/order-item/model/types";
import { OrderItemsTable } from "@/features/order-item/ui/OrderItemsTable";
import { getOrderById, getOrderHistory } from "@/features/order/model/queries";
import { OrderHistory, OrderInfo } from "@/features/order/model/types";
import StatusHistory from "@/features/order/ui/StatusHistory";
import { SupplierOrderDetailsCard } from "@/features/order/ui/SupplierOrderDetailsCard";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SupplierOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.organizationType !== "supplier") {
    throw new UnauthorizedError("Unauthorized");
  }
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
            Опубліковано:{" "}
            {order.publishedAt
              ? new Date(order.publishedAt).toLocaleString("uk-UA")
              : "Не опубліковано"}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <SupplierOrderDetailsCard order={order} />
        <OrderItemsTable items={orderItems} />
        <StatusHistory history={statusHistory} />
      </div>
    </div>
  );
}
