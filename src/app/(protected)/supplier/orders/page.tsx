import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OrdersFilters from "@/features/order/ui/OrdersFilters";
import OrderTable from "@/features/order/ui/OrderTable";
import Pagination from "@/components/common/Pagination";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { getMyOrganizationOrdersSchema } from "@/features/order/model/params.schemas";
import { getMyOrganizationOrders } from "@/features/order/model/queries";
import { OrdersList } from "@/features/order/model/types";

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

export default async function SupplierOrdersPage({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const supplierAllStatuses = [
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const query = {
    orderStatus:
      !paramsResolved.orderStatus || paramsResolved.orderStatus === "all"
        ? supplierAllStatuses
        : paramsResolved.orderStatus,
    paymentStatus:
      paramsResolved.paymentStatus !== "all"
        ? paramsResolved.paymentStatus
        : undefined,
    from: paramsResolved.dateFrom,
    to: paramsResolved.dateTo,
    page: paramsResolved.page ? Number(paramsResolved.page) : 1,
    limit: paramsResolved.limit ? Number(paramsResolved.limit) : 10,
  };

  const parsedQuery = getMyOrganizationOrdersSchema.parse(query);

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.organizationType !== "supplier") {
    throw new UnauthorizedError("Unauthorized");
  }

  const data: OrdersList = await getMyOrganizationOrders(
    parsedQuery,
    currentUser,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Мої замовлення</h1>
        <p className="text-muted-foreground mt-2">
          Перегляд та управління всіма вашими замовленнями
        </p>
      </div>
      <Suspense
        fallback={<LoadingSpinner size="md" text="Завантаження фільтрів..." />}
      >
        <OrdersFilters
          currentParams={paramsResolved}
          allowedOrderStatuses={[
            { value: "all", label: "Всі" },
            { value: "accepted", label: "Прийняті" },
            { value: "in_progress", label: "В обробці" },
            { value: "completed", label: "Завершені" },
            { value: "cancelled", label: "Скасовані" },
          ]}
        />
      </Suspense>
      <OrderTable
        orders={data.orders}
        organizationType={currentUser.organizationType}
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
