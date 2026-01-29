import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderInfo } from "../model/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";

interface Props {
  orders: OrderInfo[];
  organizationType?: "school" | "supplier";
}

export default function RecentOrdersHistoryCard({
  orders,
  organizationType,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Минулі поставки</CardTitle>
          <Button
            variant="outline"
            size="sm"
            asChild
            aria-label="Переглянути всі минулі поставки"
          >
            <Link href={`/${organizationType}/orders?dateTo=${today}`}>Усі минулі</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            За обраний період немає виконаних замовлень
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 gap-4"
              >
                <div>
                  <p className="font-medium">
                    Поставка {order.deliveryDate?.toLocaleDateString("uk-UA")}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Статус: {order.orderStatus}
                  </p>
                </div>
                <div className="flex items-center gap-6 sm:gap-8">
                  <p className="font-medium whitespace-nowrap">
                    {new Intl.NumberFormat("uk-UA", {
                      style: "currency",
                      currency: "UAH",
                    }).format(order.totalPrice)}
                  </p>
                  <Link href={`/${organizationType}/orders/${order.id}`}>
                    <Eye
                      className="h-4 w-4"
                      aria-label="Переглянути замовлення"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
