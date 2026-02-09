import { getCurrentUser } from "@/shared/auth/current-user";
import { getMyOrganizationOrders } from "@/features/order/model/queries";
import { OrdersList } from "@/features/order/model/types";
import Pagination from "@/components/common/Pagination";
import OrderRows from "@/features/order/ui/OrderRows";

interface Props {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function DraftOrdersPage({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const query = {
    orderStatus: "draft",
    page: paramsResolved.page ? Number(paramsResolved.page) : 1,
    limit: paramsResolved.limit ? Number(paramsResolved.limit) : 10,
  };

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const currentUser = await getCurrentUser();

  const data: OrdersList = await getMyOrganizationOrders(query, currentUser);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Чорновики</h1>
          <p className="text-muted-foreground mt-1">
            Усі замовлення зі статусом «Чернетка», створені сьогодні або раніше
          </p>
        </div>
      </div>
      {data.orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg bg-muted/30">
          Чернеток не знайдено
        </div>
      ) : (
        <OrderRows
          orders={data.orders}
          organizationType={currentUser.organizationType}
        />
      )}
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        totalItems={data.total}
        itemsPerPage={query.limit}
      />
    </div>
  );
}
