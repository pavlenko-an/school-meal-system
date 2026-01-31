import StatsCards from "@/features/order/ui/StatsCards";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getMyOrganizationStatsSchema } from "@/features/order/model/params.schemas";
import { getMyOrganizationStats } from "@/features/order/model/queries";
import { OrdersStats } from "@/features/order/model/types";
import { cache, Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DateRangeFilters from "@/features/order/ui/DateRangeFilter";
import OrdersPeriodCard from "@/features/order/ui/OrdersPeriodCard";

interface Props {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function SupplierDashboard({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const filters = {
    from: paramsResolved.dateFrom,
    to: paramsResolved.dateTo,
  };

  const query = getMyOrganizationStatsSchema.parse({
    from: filters.from,
    to: filters.to,
    statuses: ["accepted", "in_progress", "completed", "cancelled"],
  });

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.organizationType !== "supplier") {
    throw new UnauthorizedError("Unauthorized");
  }

  const getMyOrganizationStatsCached = cache(async () => {
    return await getMyOrganizationStats(query, currentUser);
  });

  const data: OrdersStats = await getMyOrganizationStatsCached();
  const stats = {
    totalOrders: data.stats?.totalOrders ?? 0,
    activeOrders: data.stats?.activeOrders ?? 0,
    upcomingDelivery: data.stats?.upcomingDelivery ?? null,
    totalUnpaid: data.stats?.totalUnpaid ?? 0,
  };

  return (
    <div>
      <Suspense
        fallback={<LoadingSpinner size="md" text="Завантаження фільтрів..." />}
      >
        <DateRangeFilters currentParams={paramsResolved} />
      </Suspense>
      <StatsCards
        totalOrders={stats.totalOrders}
        activeOrders={stats.activeOrders}
        upcomingDelivery={stats.upcomingDelivery}
        totalUnpaid={stats.totalUnpaid}
      />
      <div className="flex flex-col gap-2">
        <OrdersPeriodCard
          title="Майбутні замовлення"
          emptyText="Наразі немає запланованих замовлень"
          orders={data.upcoming ?? []}
          organizationType={currentUser.organizationType}
          filterParam="dateFrom"
          allLinkText="Усі майбутні"
        />
        <OrdersPeriodCard
          title="Минулі замовлення"
          emptyText="Наразі немає минулих замовлень"
          orders={data.recent ?? []}
          organizationType={currentUser.organizationType}
          filterParam="dateTo"
          allLinkText="Усі минулі"
        />
      </div>
      <div className="flex justify-center md:justify-start pt-4">
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto"
          aria-label="Переглянути опубліковані замовлення"
        >
          <Link href="/supplier/orders/published">
            Переглянути опубліковані замовлення
          </Link>
        </Button>
      </div>
    </div>
  );
}
