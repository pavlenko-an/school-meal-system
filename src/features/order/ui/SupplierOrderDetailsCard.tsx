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
import { Handshake, ShieldCheck, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { OrderInfo } from "../model/types";
import { updateOrderStatus, updatePaymentStatus } from "../api/actions";
import { OrderInfoDisplay } from "./OrderInfoDisplay";
import { useTransition } from "react";

interface Props {
  order: OrderInfo;
}

export function SupplierOrderDetailsCard({ order }: Props) {
  const router = useRouter();

  const permissions = {
    canAccept: order.orderStatus === "published",
    canVerifyPayment:
      order.orderStatus === "accepted" && order.paymentStatus === "paid",
    canStartProcessing:
      order.orderStatus === "accepted" && order.paymentStatus === "verified",
    canCancel:
      order.orderStatus === "accepted" && order.paymentStatus === "unpaid",
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

  const [isAccepting, startAccept] = useTransition();
  const [isVerifyingPayment, startVerifyPayment] = useTransition();
  const [isStartingProcessing, startStartProcessing] = useTransition();
  const [isCancelling, startCancel] = useTransition();

  const handleAccept = () => {
    startAccept(async () => {
      const result = await updateOrderStatus(null, {
        id: order.id,
        status: "accepted",
      });

      if (result?.success) {
        toast.success("Замовлення прийнято");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося прийняти");
      }
    });
  };

  const handleVerifyPayment = () => {
    startVerifyPayment(async () => {
      const result = await updatePaymentStatus(null, {
        id: order.id,
        status: "verified",
      });

      if (result?.success) {
        toast.success("Замовлення позначено як верифіковане");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося позначити як верифіковане");
      }
    });
  };

  const handleStartProcessing = () => {
    startStartProcessing(async () => {
      const result = await updateOrderStatus(null, {
        id: order.id,
        status: "in_progress",
      });

      if (result?.success) {
        toast.success("Замовлення позначено як в обробці");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося позначити як в обробці");
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
        {permissions.canAccept && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isAccepting}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                aria-label="Прийняти замовлення"
              >
                <Handshake className="w-4 h-4 mr-2" />
                {isAccepting ? "Приймаємо..." : "Прийняти замовлення"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Прийняти замовлення?</AlertDialogTitle>
                <AlertDialogDescription>
                  Після прийняття замовлення, інші постачальники більше не
                  зможуть його прийняти. Натискайте &quot;Прийняти
                  замовлення&quot;, лише якщо ви впевнені, що зможете його
                  виконати.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAccept}
                  className="cursor-pointer"
                >
                  Прийняти
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {permissions.canVerifyPayment && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isVerifyingPayment}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                aria-label="Верифікувати оплату"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {isVerifyingPayment ? "Верифікація..." : "Верифікувати оплату"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Позначити замовлення як верифіковане?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Після позначення замовлення як верифіковане, статус оплати
                  буде оновлено. Натискайте &quot;Позначити як
                  верифіковане&quot;, лише якщо ви впевнені, що оплата була
                  отримана.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleVerifyPayment}
                  className="cursor-pointer"
                >
                  Позначити як верифіковане
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {permissions.canStartProcessing && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isStartingProcessing}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                aria-label="Почати обробку замовлення"
              >
                <Truck className="w-4 h-4 mr-2" />
                {isStartingProcessing ? "Починаємо..." : "Почати обробку"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Почати обробку замовлення?</AlertDialogTitle>
                <AlertDialogDescription>
                  Після початку обробки будь-які подальші зміни будуть
                  заборонені. Натискайте &quot;Почати обробку&quot;, лише якщо
                  ви впевнені, що зможете виконати замовлення вчасно.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleStartProcessing}
                  className="cursor-pointer"
                >
                  Почати обробку
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
                <XCircle className="w-4 h-4 mr-2" />
                {isCancelling ? "Скасовуємо..." : "Скасувати замовлення"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Скасувати замовлення?</AlertDialogTitle>
                <AlertDialogDescription>
                  Замовлення отримає статус &quot;cancelled&quot;. Воно
                  залишиться в базі для історії, але не буде оброблятися далі.
                  Натискайте &quot;Скасувати&quot;, лише якщо ви впевнені, що не
                  зможете виконати це замовлення.
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

        {!hasAnyAction && (
          <p className="text-sm text-muted-foreground italic">Дії недоступні</p>
        )}
      </div>
    </Card>
  );
}
