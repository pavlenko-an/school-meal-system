import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { OrderInfo } from "../model/types";

interface Props {
  order: OrderInfo;
}

export function OrderInfoDisplay({ order }: Props) {
  const paymentStatusLabels: Record<OrderInfo["paymentStatus"], string> = {
    unpaid: "Не сплачено",
    paid: "Сплачено",
    verified: "Підтверджено",
  };

  return (
    <CardContent className="grid gap-6 md:grid-cols-2">
      <div className="space-y-1">
        <dt className="text-sm font-medium text-muted-foreground">
          Дата поставки
        </dt>
        <dd className="text-lg font-medium">
          {order.deliveryDate?.toLocaleDateString("uk-UA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) ?? "Не вказано"}
        </dd>
      </div>

      <div className="space-y-1">
        <dt className="text-sm font-medium text-muted-foreground">
          Статус оплати
        </dt>
        <dd>
          <Badge
            variant={order.paymentStatus === "paid" ? "default" : "secondary"}
          >
            {paymentStatusLabels[order.paymentStatus]}
          </Badge>
        </dd>
      </div>

      <div className="space-y-1 md:col-span-2">
        <dt className="text-sm font-medium text-muted-foreground">Коментар</dt>
        <dd className="text-base">
          {order.comment || (
            <span className="text-muted-foreground italic">
              Немає коментаря
            </span>
          )}
        </dd>
      </div>

      <div className="space-y-1 md:col-span-2">
        <dt className="text-sm font-medium text-muted-foreground">
          Загальна сума
        </dt>
        <dd className="text-2xl font-bold">
          {order.totalPrice.toFixed(2)} ₴
        </dd>
      </div>
    </CardContent>
  );
}
