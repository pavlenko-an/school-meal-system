import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OrdersFilters from "@/features/order/ui/OrdersFilters";
import OrderTable from "@/features/order/ui/OrderTable";
import Pagination from "@/components/common/Pagination";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { OrdersList } from "@/features/order";
import { orderService } from "@/features/order/services/order.service";
import { getMyOrganizationOrdersSchema } from "@/features/order/model/get-my-organization-orders.schema";

export default async function SchoolOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    payment?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const paramsResolved = await searchParams;

  const params = new URLSearchParams();
  if (paramsResolved.status && paramsResolved.status !== "all") {
    params.set("status", paramsResolved.status);
  }
  if (paramsResolved.payment && paramsResolved.payment !== "all") {
    params.set("payment", paramsResolved.payment);
  }
  if (paramsResolved.dateFrom) {
    params.set("dateFrom", paramsResolved.dateFrom);
  }
  if (paramsResolved.dateTo) {
    params.set("dateTo", paramsResolved.dateTo);
  }
  params.set("page", paramsResolved.page || "1");
  params.set("limit", paramsResolved.limit || "10");

  const parsedQuery = getMyOrganizationOrdersSchema.parse({
    from: paramsResolved.dateFrom,
    to: paramsResolved.dateTo,
    orderStatus: paramsResolved.status,
    paymentStatus: paramsResolved.payment,
    page: paramsResolved.page ? Number(paramsResolved.page) : 1,
    limit: paramsResolved.limit ? Number(paramsResolved.limit) : 10,
  });

  let data: OrdersList;
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
    data = await orderService.getMyOrganizationOrders.execute(
      parsedQuery,
      currentUser,
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Не вдалося завантажити інформаційну панель");
    }
  }

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
        <OrdersFilters currentParams={paramsResolved} />
      </Suspense>

      <OrderTable orders={data.orders} />

      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        totalItems={data.total}
        currentParams={paramsResolved}
      />
    </div>
  );
}
