import StatsCards from "@/features/order/ui/StatsCards";
import UpcomingOrdersCard from "@/features/order/ui/UpcomingOrdersCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMyOrganizationStatsSchema, OrdersStats } from "@/features/order";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import MonthsSelector from "@/features/order/ui/MonthsSelector";
import RecentOrdersCard from "@/features/order/ui/RecentOrdersCard";
import { getMyOrganizationStats } from "@/features/order/queries/get-my-organization-stats.query";

type Props = {
  searchParams?: Promise<{ months?: number }>;
};

export default async function SchoolDashboard({ searchParams }: Props) {
  const params = await searchParams;
  const monthsParsed = Number(params?.months);
  const initialMonths: 1 | 3 | 6 =
    monthsParsed === 1 || monthsParsed === 3 || monthsParsed === 6
      ? monthsParsed
      : 1;

  const now = new Date();
  const from = new Date(
    now.getFullYear(),
    now.getMonth() - initialMonths,
    now.getDate(),
  );

  const statsQuery = getMyOrganizationStatsSchema.parse({
    from,
  });

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new UnauthorizedError("Unauthorized");
  }
  const data: OrdersStats = await getMyOrganizationStats(
    statsQuery,
    currentUser,
  );
  const stats = {
    ordersCount: data.stats?.ordersCount ?? 0,
    nextDelivery: data.stats?.nextDelivery ?? null,
    unpaidAmount: data.stats?.unpaidAmount ?? 0,
  };

  return (
    <div>
      <MonthsSelector initialMonths={initialMonths} />
      <StatsCards
        ordersCount={stats.ordersCount}
        nextDelivery={stats.nextDelivery}
        unpaidAmount={stats.unpaidAmount}
      />
      <UpcomingOrdersCard orders={data.upcoming ?? []} />
      <RecentOrdersCard orders={data.recent ?? []} />
      <div className="flex justify-center md:justify-start pt-4">
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto"
          aria-label="Створити нове замовлення"
        >
          <Link href="/school/orders/new">Створити нове замовлення</Link>
        </Button>
      </div>
    </div>
  );
}
