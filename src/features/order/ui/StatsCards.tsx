import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, Package } from "lucide-react";

interface Props {
  ordersCount: number;
  nextDelivery: {
    deliveryDate: Date | null;
    comment: string | null;
  } | null;
  unpaidAmount: number;
}

export default function StatsCards({
  ordersCount,
  nextDelivery,
  unpaidAmount,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-3 mb-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Замовлень за обраний період
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ordersCount}</div>
          <p className="text-xs text-muted-foreground">
            +3 порівняно з минулим місяцем (необхідно змінити статичне значення)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Наступна поставка
          </CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {nextDelivery
              ? nextDelivery.deliveryDate?.toLocaleDateString("uk-UA")
              : "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            {nextDelivery?.comment ?? "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Сума неоплачених за обраний період
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("uk-UA", {
              style: "currency",
              currency: "UAH",
            }).format(unpaidAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {ordersCount} замовлення
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
