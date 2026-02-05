import { format, startOfDay } from "date-fns";
import { uk } from "date-fns/locale";
import { getMyOrganizationOrdersSchema } from "@/features/order/model/params.schemas";
import { getCurrentUser } from "@/shared/auth/current-user";
import { getMyOrganizationOrders } from "@/features/order/model/queries";
import { OrdersList } from "@/features/order/model/types";
import DateRangeFilters from "@/features/order/ui/DateRangeFilter";
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

export default async function PublishedOrdersPage({ searchParams }: Props) {
  const paramsResolved = await searchParams;
  const today = startOfDay(new Date());

  const fromStr = paramsResolved.dateFrom
    ? paramsResolved.dateFrom
    : today.toISOString().split("T")[0];
  const toStr = paramsResolved.dateTo ? paramsResolved.dateTo : undefined;
  const page = paramsResolved.page ? Number(paramsResolved.page) : 1;
  const limit = paramsResolved.limit ? Number(paramsResolved.limit) : 10;

  const query = {
    orderStatus: "published",
    from: fromStr,
    to: toStr,
    page,
    limit,
  };

  const parsedQuery = getMyOrganizationOrdersSchema.parse(query);

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const currentUser = await getCurrentUser();

  const data: OrdersList = await getMyOrganizationOrders(
    parsedQuery,
    currentUser,
  );

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Опубліковані замовлення
          </h1>
          <p className="text-muted-foreground mt-1">
            Замовлення зі статусом «Опубліковано» з датою поставки від{" "}
            {format(new Date(fromStr), "dd.MM.yyyy", { locale: uk })}
          </p>
        </div>

        <DateRangeFilters
          currentParams={{
            dateFrom: fromStr,
            dateTo: toStr,
          }}
        />
      </div>
      <OrderRows orders={data.orders} organizationType="supplier" />
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        totalItems={data.total}
        itemsPerPage={limit}
      />
    </div>
  );
}
