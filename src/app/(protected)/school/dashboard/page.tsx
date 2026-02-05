import StatsCards from "@/features/order/ui/StatsCards";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/shared/auth/current-user";
import { getMyOrganizationStats } from "@/features/order/model/queries";
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

export default async function SchoolDashboard({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const query = {
    from: paramsResolved.dateFrom,
    to: paramsResolved.dateTo,
    statuses: [
      "new",
      "published",
      "accepted",
      "in_progress",
      "completed",
      "cancelled",
    ],
  };

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const currentUser = await getCurrentUser();

  const getMyOrganizationStatsCached = cache(async () => {
    return await getMyOrganizationStats(query, currentUser);
  });

  const data = await getMyOrganizationStatsCached();
  const stats = {
    totalOrders: data?.stats?.totalOrders ?? 0,
    activeOrders: data?.stats?.activeOrders ?? 0,
    upcomingDelivery: data?.stats?.upcomingDelivery ?? null,
    totalUnpaid: data?.stats?.totalUnpaid ?? 0,
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
          aria-label="Створити нове замовлення"
        >
          <Link href="/school/orders/create">Створити нове замовлення</Link>
        </Button>
      </div>
    </div>
  );
}
