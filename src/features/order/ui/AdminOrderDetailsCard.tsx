"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderInfo } from "../model/types";
import { OrderInfoDisplay } from "./OrderInfoDisplay";

interface Props {
  order: OrderInfo;
}

export function AdminOrderDetailsCard({ order }: Props) {
  const statusLabels: Record<OrderInfo["orderStatus"], string> = {
    new: "Новий",
    published: "Опубліковано",
    accepted: "Прийнято",
    in_progress: "В обробці",
    completed: "Завершено",
    cancelled: "Скасовано",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Основна інформація</span>
          <Badge
            variant={
              order.orderStatus === "completed"
                ? "default"
                : order.orderStatus === "cancelled"
                  ? "destructive"
                  : "secondary"
            }
            className="capitalize"
          >
            {statusLabels[order.orderStatus]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <OrderInfoDisplay order={order} />
    </Card>
  );
}
