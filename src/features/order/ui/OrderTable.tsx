"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Eye } from "lucide-react";
import { OrdersInfo } from "../model/order.types";

interface Props {
  orders: OrdersInfo[];
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  new: "bg-gray-200 text-gray-800",
  published: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderTable({ orders, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Замовлень не знайдено
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата поставки</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Оплата</TableHead>
            <TableHead className="text-right">Сума</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/50">
              <TableCell>
                {format(new Date(order.deliveryDate), "dd MMMM yyyy", {
                  locale: uk,
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[order.orderStatus] || "bg-gray-100"}
                >
                  {order.orderStatus === "new"
                    ? "Новий"
                    : order.orderStatus === "published"
                      ? "Опубліковано"
                      : order.orderStatus === "accepted"
                        ? "Прийнято"
                        : order.orderStatus === "in_progress"
                          ? "В роботі"
                          : order.orderStatus === "completed"
                            ? "Завершено"
                            : "Скасовано"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "default" : "secondary"
                  }
                >
                  {order.paymentStatus === "paid"
                    ? "Оплачено"
                    : order.paymentStatus === "verified"
                      ? "Підтверджено"
                      : "Не оплачено"}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {order.totalPrice} грн
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/school/orders/${order.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
