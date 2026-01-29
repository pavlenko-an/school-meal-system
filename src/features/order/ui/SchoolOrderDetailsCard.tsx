"use client";

import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { OrderInfo } from "../model/types";
import {
  deleteOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from "../api/actions";
import { OrderInfoDisplay } from "./OrderInfoDisplay";
import { useTransition } from "react";

interface Props {
  order: OrderInfo;
}

export function SchoolOrderDetailsCard({ order }: Props) {
  const router = useRouter();

  const permissions = {
    canDelete: order.orderStatus === "new",
    canEdit: order.orderStatus === "new",
    canPublish: order.orderStatus === "new",
    canMarkAsPaid:
      order.paymentStatus === "unpaid" && order.orderStatus === "accepted",
    canComplete: order.orderStatus === "in_progress",
    canCancel: order.orderStatus === "published",
  };

  const hasAnyAction = Object.values(permissions).some(Boolean);

  const statusLabels: Record<OrderInfo["orderStatus"], string> = {
    new: "Новий",
    published: "Опубліковано",
    accepted: "Прийнято",
    in_progress: "В обробці",
    completed: "Завершено",
    cancelled: "Скасовано",
  };

  const [isDeleting, startDelete] = useTransition();
  const [isPublishing, startPublish] = useTransition();
  const [isMarkingAsPaid, startMarkAsPaid] = useTransition();
  const [isCompleting, startComplete] = useTransition();
  const [isCancelling, startCancel] = useTransition();

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

  const handleMarkAsPaid = () => {
    startMarkAsPaid(async () => {
      const result = await updatePaymentStatus(null, {
        id: order.id,
        status: "paid",
      });

      if (result?.success) {
        toast.success("Замовлення позначено як оплачене");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося позначити як оплачене");
      }
    });
  };

  const handleComplete = () => {
    startComplete(async () => {
      const result = await updateOrderStatus(null, {
        id: order.id,
        status: "completed",
      });

      if (result?.success) {
        toast.success("Замовлення позначено як завершене");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося позначити як завершене");
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
      <OrderInfoDisplay order={order} />
      <div className="p-6 pt-0 flex flex-wrap gap-4">
        {permissions.canEdit && (
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto cursor-pointer"
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
                <AlertDialogAction
                  onClick={handlePublish}
                  className="cursor-pointer"
                >
                  Опублікувати
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {permissions.canMarkAsPaid && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                disabled={isMarkingAsPaid}
                className="w-full sm:w-auto cursor-pointer"
                aria-label="Позначити замовлення як сплачене"
              >
                {isMarkingAsPaid
                  ? "Позначаємо як сплачене..."
                  : "Позначити як сплачене"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Позначити замовлення як сплачене?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Після позначення замовлення як сплачене, статус оплати буде
                  оновлено. Натискайте &quot;Позначити як сплачене&quot;, лише
                  якщо ви впевнені, що оплата була виконана.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleMarkAsPaid}
                  className="cursor-pointer"
                >
                  Позначити як сплачене
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {permissions.canComplete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isCompleting}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                aria-label="Завершити замовлення"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isCompleting ? "Завершуємо..." : "Завершити замовлення"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Завершити замовлення?</AlertDialogTitle>
                <AlertDialogDescription>
                  Після завершення будь-які подальші зміни будуть заборонені.
                  Натискайте &quot;Завершити&quot;, лише якщо ви впевнені, що
                  всі поставки виконані.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleComplete}
                  className="cursor-pointer"
                >
                  Завершити
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
                className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/10 cursor-pointer"
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
                  className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                >
                  Скасувати
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
                <Trash2 className="w-4 h-4 mr-2" />
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
                  className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                >
                  Видалити
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {!hasAnyAction && (
          <p className="text-sm text-muted-foreground italic">Дії недоступні</p>
        )}
      </div>
    </Card>
  );
}
