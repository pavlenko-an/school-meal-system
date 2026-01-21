"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OrderHeader from "./OrderHeader";
import OrderItemsList from "./OrderItemsList";
import OrderSummary from "./OrderSummary";
import OrderActions from "./OrderActions";

const formSchema = z.object({
  deliveryDate: z.date().min(new Date(), "Дата має бути в майбутньому"),
  comment: z.string().max(500, "Коментар не більше 500 символів").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  orderId: string;
  initialOrder: any;
  initialItems: any[];
  menuItems: any[];
}

export default function OrderEditForm({
  orderId,
  initialOrder,
  initialItems,
  menuItems,
}: Props) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(initialItems);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryDate: new Date(initialOrder.deliveryDate),
      comment: initialOrder.comment || "",
    },
  });

  const totalPrice = localItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const refreshItems = async () => {
    try {
      const fresh = await apiFetch(
        `/order-items?orderId=${orderId}&include=menuItem`,
      );
      setLocalItems(fresh);
    } catch (err) {
      console.error(err);
    }
  };

  const saveOrder = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({
          deliveryDate: format(form.getValues("deliveryDate"), "yyyy-MM-dd"),
          comment: form.getValues("comment"),
        }),
      });
      toast.success("Зміни збережено");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Помилка збереження");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <OrderHeader form={form} />

      <OrderItemsList
        items={localItems}
        menuItems={menuItems}
        onAddItem={async (menuItemId, quantity) => {
          try {
            await apiFetch("/order-items", {
              method: "POST",
              body: JSON.stringify({ orderId, menuItemId, quantity }),
            });
            await refreshItems();
            toast.success("Страву додано");
          } catch (err: any) {
            toast.error(err.message || "Помилка додавання");
          }
        }}
        onUpdateQuantity={async (itemId, quantity) => {
          try {
            await apiFetch(`/order-items/${itemId}`, {
              method: "PATCH",
              body: JSON.stringify({ quantity }),
            });
            await refreshItems();
          } catch (err: any) {
            toast.error(err.message || "Помилка оновлення");
          }
        }}
        onRemoveItem={async (itemId) => {
          try {
            await apiFetch(`/order-items/${itemId}`, { method: "DELETE" });
            await refreshItems();
            toast.success("Позицію видалено");
          } catch (err: any) {
            toast.error(err.message || "Помилка видалення");
          }
        }}
      />

      <OrderSummary totalPrice={totalPrice} />

      <OrderActions
        onSave={saveOrder}
        onPublish={async () => {
          if (!confirm("Опублікувати?")) return;
          try {
            await apiFetch(`/orders/${orderId}/status`, {
              method: "PATCH",
              body: JSON.stringify({ status: "published" }),
            });
            toast.success("Опубліковано");
            router.push("/school/orders");
          } catch (err: any) {
            toast.error(err.message || "Помилка");
          }
        }}
        onDelete={async () => {
          if (!confirm("Видалити назавжди?")) return;
          try {
            await apiFetch(`/orders/${orderId}`, { method: "DELETE" });
            toast.success("Видалено");
            router.push("/school/orders");
          } catch (err: any) {
            toast.error(err.message || "Помилка");
          }
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
