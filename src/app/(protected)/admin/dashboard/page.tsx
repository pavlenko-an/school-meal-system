import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllOrdersStats,
  getRecentOrders,
} from "@/features/order/model/queries";
import { OrderInfo } from "@/features/order/model/types";
import {
  getAllOrganizationsStats,
  getTopSchoolsByOrderValue,
} from "@/features/organization/model/queries";
import { getAllUsersStats } from "@/features/user/model/queries";
import { format } from "date-fns";
import {
  Building2,
  DollarSign,
  Eye,
  PlusCircle,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cache } from "react";

export default async function AdminDashboardPage() {
  const getAllOrganizationsStatsCached = cache(async () => {
    return await getAllOrganizationsStats();
  });
  const getAllUsersStatsCached = cache(async () => {
    return await getAllUsersStats();
  });
  const getAllOrdersStatsCached = cache(async () => {
    return await getAllOrdersStats();
  });
  const getRecentOrdersCached = cache(async (limit: number) => {
    return await getRecentOrders(limit);
  });
  const getTopSchoolsByOrderValueCached = cache(async (limit: number) => {
    return await getTopSchoolsByOrderValue(limit);
  });

  const [orgStats, userStats, orderStats, recentOrders, topSchools] =
    await Promise.all([
      getAllOrganizationsStatsCached(),
      getAllUsersStatsCached(),
      getAllOrdersStatsCached(),
      getRecentOrdersCached(5),
      getTopSchoolsByOrderValueCached(5),
    ]);

  const statusLabels: Record<OrderInfo["orderStatus"], string> = {
    new: "Новий",
    published: "Опубліковано",
    accepted: "Прийнято",
    in_progress: "В обробці",
    completed: "Завершено",
    cancelled: "Скасовано",
  };

  const statusColors: Record<OrderInfo["orderStatus"], string> = {
    new: "bg-gray-200 text-gray-800",
    published: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-indigo-100 text-indigo-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Адмін-панель</h1>
          <p className="text-muted-foreground mt-2">
            Огляд системи станом на сьогодні
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/organizations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Додати організацію
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/admin/users/new">Зареєструвати користувача</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/admin/orders">Всі замовлення</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Організацій</CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orgStats.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {orgStats.schools} шкіл • {orgStats.suppliers} постачальників
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Користувачів</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userStats.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {userStats.admins} адмінів • {userStats.employees} співробітників
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Замовлень</CardTitle>
            <ShoppingCart className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {orderStats.statusCounts.new} нових •{" "}
              {orderStats.statusCounts.accepted +
                orderStats.statusCounts.in_progress}{" "}
              активних
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Неоплачено</CardTitle>
            <DollarSign className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {orderStats.unpaidValue.toLocaleString("uk-UA")} ₴
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              з {orderStats.totalValue.toLocaleString("uk-UA")} ₴ загалом
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Поставки в обробці
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {orderStats.upcomingActiveDeliveries}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {orderStats.statusCounts.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-2">за весь час</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Скасовано</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {orderStats.statusCounts.cancelled}
            </div>
            <p className="text-xs text-muted-foreground mt-2">за весь час</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Останні замовлення</h2>
          <Button variant="link" asChild>
            <Link href="/admin/orders">Всі замовлення →</Link>
          </Button>
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№</TableHead>
                <TableHead>Організація</TableHead>
                <TableHead>Сума</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {order.school?.name || order.supplier?.name || "—"}
                  </TableCell>
                  <TableCell>{order.totalPrice.toLocaleString()} ₴</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[order.orderStatus] || "bg-gray-100"
                      }
                      variant={
                        order.orderStatus === "completed"
                          ? "default"
                          : order.orderStatus === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {statusLabels[order.orderStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.createdAt), "dd.MM.yy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Топ-5 шкіл за сумою замовлень
          </h2>
          <Button variant="link" asChild>
            <Link href="/admin/organizations?type=school">Всі школи →</Link>
          </Button>
        </div>

        <div className="rounded-lg border divide-y">
          {topSchools.map((school, idx) => (
            <div
              key={school.name}
              className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-muted-foreground w-8">
                  {idx + 1}.
                </span>
                <div>
                  <div className="font-medium">{school.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {school.orderCount} замовлень
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">
                  {school.totalValue.toLocaleString("uk-UA")} ₴
                </div>
              </div>
            </div>
          ))}

          {topSchools.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Шкіл з замовленнями не знайдено
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
