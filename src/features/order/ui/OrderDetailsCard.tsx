"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { OrderInfo } from "../model/order.types";
import { deleteOrder } from "../actions/delete-order.action";
import { updateOrderStatus } from "../actions/update-order-status.action";
import { startTransition, useActionState, useEffect } from "react";
import Link from "next/link";

interface Props {
  order: OrderInfo;
}

export function OrderDetailsCard({ order }: Props) {
  const router = useRouter();

  const isNew = order.orderStatus === "new";
  const isPublished = order.orderStatus === "published";
  const canDelete = isNew;
  const canEdit = isNew;
  const canCancel = isPublished;

  const statusLabels: Record<OrderInfo["orderStatus"], string> = {
    new: "Новий",
    published: "Опубліковано",
    accepted: "Прийнято",
    in_progress: "В роботі",
    completed: "Завершено",
    cancelled: "Скасовано",
  };

  const paymentStatusLabels: Record<OrderInfo["paymentStatus"], string> = {
    unpaid: "Не оплачено",
    paid: "Оплачено",
    verified: "Підтверджено",
  };

  const [cancelState, cancelAction, isCancelPending] = useActionState(
    updateOrderStatus,
    null,
  );

  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteOrder,
    null,
  );

  useEffect(() => {
    if (cancelState?.success) {
      toast.success("Замовлення скасовано");
      router.refresh();
    }
    if (cancelState?.success === false && cancelState.error) {
      toast.error(cancelState.error);
    }
  }, [cancelState, router]);

  useEffect(() => {
    if (deleteState?.success) {
      toast.success("Замовлення повністю видалено");
      router.push("/school/orders");
    }
    if (deleteState?.success === false && deleteState.error) {
      toast.error(deleteState.error);
    }
  }, [deleteState, router]);

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
            })}
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
          <dt className="text-sm font-medium text-muted-foreground">
            Коментар
          </dt>
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
          <dd className="text-2xl font-bold">{order.totalPrice} грн</dd>
        </div>
      </CardContent>

      <div className="p-6 pt-0 flex flex-wrap gap-4">
        {canEdit && (
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
            aria-label="Редагувати замовлення"
          >
            <Link href={`/school/orders/${order.id}/edit`}>
              Редагувати замовлення
            </Link>
          </Button>
        )}

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeletePending}
                className="w-full sm:w-auto cursor-pointer"
                aria-label="Видалити замовлення"
              >
                {isDeletePending ? "Видаляємо..." : "Видалити замовлення"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Видалити замовлення назавжди?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Замовлення буде повністю видалено з бази даних. Цю дію
                  неможливо скасувати.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(() => deleteAction({ id: order.id }));
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Видалити
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isCancelPending}
                className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/10"
                aria-label="Скасувати замовлення"
              >
                {isCancelPending ? "Скасовуємо..." : "Скасувати замовлення"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Скасувати замовлення?</AlertDialogTitle>
                <AlertDialogDescription>
                  Замовлення отримає статус &quot;cancelled&quot;. Воно
                  залишиться в базі для історії, але постачальники більше не
                  зможуть його прийняти.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Залишити</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(() =>
                      cancelAction({ id: order.id, status: "cancelled" }),
                    );
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Скасувати
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {!canDelete && !canCancel && (
          <p className="text-sm text-muted-foreground italic">
            Дії недоступні
          </p>
        )}
      </div>
    </Card>
  );
}
