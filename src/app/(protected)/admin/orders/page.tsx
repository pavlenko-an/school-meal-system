import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OrdersFilters from "@/features/order/ui/OrdersFilters";
import OrderTable from "@/features/order/ui/OrderTable";
import Pagination from "@/components/common/Pagination";
import { getCurrentUser } from "@/shared/auth/current-user";
import { getAllOrders } from "@/features/order/model/queries";
import { OrdersList } from "@/features/order/model/types";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

interface Props {
  searchParams: Promise<{
    orderStatus?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const query = {
    orderStatus:
      paramsResolved.orderStatus !== "all"
        ? (paramsResolved.orderStatus as keyof typeof OrderStatus)
        : undefined,
    paymentStatus:
      paramsResolved.paymentStatus !== "all"
        ? (paramsResolved.paymentStatus as keyof typeof PaymentStatus)
        : undefined,
    from: paramsResolved.dateFrom
      ? new Date(paramsResolved.dateFrom)
      : undefined,
    to: paramsResolved.dateTo ? new Date(paramsResolved.dateTo) : undefined,
    page: paramsResolved.page ? Number(paramsResolved.page) : 1,
    limit: paramsResolved.limit ? Number(paramsResolved.limit) : 10,
  };

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const currentUser = await getCurrentUser();

  const data: OrdersList = await getAllOrders(query, currentUser);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Усі замовлення</h1>
        <p className="text-muted-foreground mt-2">
          Перегляд усіх замовлень від усіх організацій
        </p>
      </div>
      <Suspense
        fallback={<LoadingSpinner size="md" text="Завантаження фільтрів..." />}
      >
        <OrdersFilters currentParams={paramsResolved} />
      </Suspense>
      <OrderTable
        orders={data.orders}
        organizationType={currentUser.organizationType}
        role={currentUser.role}
      />
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        totalItems={data.total}
        currentParams={paramsResolved}
      />
    </div>
  );
}
