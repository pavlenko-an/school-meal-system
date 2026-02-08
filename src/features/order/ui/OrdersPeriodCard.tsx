import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import Link from "next/link";
import { OrderInfo } from "../model/types";

interface Props {
  title: string;
  emptyText: string;
  orders: OrderInfo[];
  organizationType?: "school" | "supplier";
  filterParam: "dateFrom" | "dateTo";
  allLinkText: string;
}

export default function OrdersPeriodCard({
  title,
  emptyText,
  orders,
  organizationType,
  filterParam,
  allLinkText,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  const basePath = `/${organizationType}/orders`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>

          <Button
            variant="outline"
            size="sm"
            asChild
            aria-label={`Переглянути всі ${allLinkText.toLowerCase()}`}
          >
            <Link href={`${basePath}?${filterParam}=${today}`}>
              {allLinkText}
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    Поставка{" "}
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).toLocaleDateString("uk-UA")
                      : "—"}
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
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
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
