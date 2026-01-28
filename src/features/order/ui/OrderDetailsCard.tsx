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
import { OrderInfo } from "../model/types";
import { useTransition } from "react";
import Link from "next/link";
import { deleteOrder, updateOrderStatus } from "../api/actions";

interface Props {
  order: OrderInfo;
}

export function OrderDetailsCard({ order }: Props) {
  const router = useRouter();

  const permissions = {
    canDelete: order.orderStatus === "new",
    canEdit: order.orderStatus === "new",
    canPublish: order.orderStatus === "new",
    canCancel: order.orderStatus === "published",
  };

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

  const [isPublishing, startPublish] = useTransition();
  const [isCancelling, startCancel] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const handlePublish = () => {
    startPublish(async () => {
      const result = await updateOrderStatus(null, {
        id: order.id,
        status: "published",
      });

      if (result?.success) {
        toast.success("Замовлення опубліковано");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося опублікувати");
      }
    });
  };

  const handleCancel = () => {
    startCancel(async () => {
      const result = await updateOrderStatus(null, {
        id: order.id,
        status: "cancelled",
      });

      if (result?.success) {
        toast.success("Замовлення скасовано");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося скасувати");
      }
    });
  };

  const handleDelete = () => {
    startDelete(async () => {
      const result = await deleteOrder(null, { id: order.id });

      if (result?.success) {
        toast.success("Замовлення повністю видалено");
        router.push("/school/orders");
      } else {
        toast.error(result?.error ?? "Не вдалося видалити");
      }
    });
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
        {permissions.canEdit && (
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

        {permissions.canPublish && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                disabled={isPublishing}
                className="w-full sm:w-auto cursor-pointer"
                aria-label="Опублікувати замовлення"
              >
                {isPublishing ? "Публікуємо..." : "Опублікувати замовлення"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Опублікувати замовлення?</AlertDialogTitle>
                <AlertDialogDescription>
                  Після публікації редагування буде заборонено. Постачальники
                  побачать замовлення в списку.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublish}>
                  Опублікувати
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {permissions.canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting}
                className="w-full sm:w-auto cursor-pointer"
                aria-label="Видалити замовлення"
              >
                {isDeleting ? "Видаляємо..." : "Видалити замовлення"}
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
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Видалити
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {permissions.canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isCancelling}
                className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/10"
                aria-label="Скасувати замовлення"
              >
                {isCancelling ? "Скасовуємо..." : "Скасувати замовлення"}
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
                  onClick={handleCancel}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Скасувати
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {!permissions.canDelete && !permissions.canCancel && (
          <p className="text-sm text-muted-foreground italic">Дії недоступні</p>
        )}
      </div>
    </Card>
  );
}
