import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, PackageCheck } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface Props {
  totalOrders: number;
  activeOrders: number;
  upcomingDelivery: {
    deliveryDate: Date | null;
    organizationName: string | null;
    comment: string | null;
  } | null;
  totalUnpaid: number;
}

export default function StatsCards({
  totalOrders,
  activeOrders,
  upcomingDelivery,
  totalUnpaid,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-4 mb-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Усього замовлень
          </CardTitle>
          <PackageCheck className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">за весь час</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Активних замовлень
          </CardTitle>
          <PackageCheck className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeOrders}</div>
          <p className="text-xs text-muted-foreground">за весь час</p>
        </CardContent>
      </Card>

      {upcomingDelivery && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Наступна поставка
            </CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xl font-bold">
                  {format(upcomingDelivery.deliveryDate!, "dd MMMM yyyy", {
                    locale: uk,
                  })}
                </p>
                <p className="text-md mt-1">
                  {upcomingDelivery.organizationName}
                </p>
                {upcomingDelivery.comment && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Коментар: {upcomingDelivery.comment}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Неоплачених замовлень
          </CardTitle>
          <DollarSign className="h-5 w-5 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("uk-UA", {
              style: "currency",
              currency: "UAH",
            }).format(totalUnpaid)}{" "}
          </div>
          <p className="text-xs text-muted-foreground">за весь час</p>
        </CardContent>
      </Card>
    </div>
  );
}
