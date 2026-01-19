import StatsCards from "@/features/order/ui/StatsCards";
import UpcomingOrdersCard from "@/features/order/ui/UpcomingOrdersCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrdersStats } from "@/features/order/model/order.types";
import { getMyOrganizationOrders } from "@/features/order/lib/order";
import { getCurrentUser } from "@/shared/auth/current-user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import MonthsSelector from "@/features/order/ui/MonthsSelector";
import { getMyOrganizationOrdersSchema } from "@/features/order/model/get-my-organization-orders.schema";
import RecentOrdersCard from "@/features/order/ui/RecentOrdersCard";

export default async function SchoolDashboardClient({
  searchParams,
}: {
  searchParams?: Promise<{ months?: number }>;
}) {
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

  const parsedQuery = getMyOrganizationOrdersSchema.parse({
    from,
    limit: 20,
    offset: 0,
  });

  let data: OrdersStats;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    data = await getMyOrganizationOrders(parsedQuery, currentUser);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Не вдалося завантажити інформаційну панель");
    }
  }

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
      <UpcomingOrdersCard orders={data.upcoming || []} />
      <RecentOrdersCard orders={data.recent || []} />
      <div className="flex justify-center md:justify-start pt-4">
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/school/orders/new">Створити нове замовлення</Link>
        </Button>
      </div>
    </div>
  );
}
