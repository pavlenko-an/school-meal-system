"use client";

import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import OrderHeader from "./OrderHeader";
import OrderActions from "./OrderActions";
import { createOrderInput, OrderInfo } from "../model/types";
import { zodResolver } from "@hookform/resolvers/zod";
import AddItemDialog from "@/features/order-item/ui/AddItemDialog";
import OrderItemRow from "@/features/order-item/ui/OrderItemRow";
import { OrderItemInfo } from "@/features/order-item/model/types";
import { MenuItemInfo } from "@/features/menu-item/model/types";
import { createOrderSchema } from "../model/input.schemas";
import { deleteOrder, updateOrder } from "../api/actions";
import {
  createOrderItem,
  deleteOrderItem,
  updateOrderItem,
} from "@/features/order-item/api/actions";

interface Props {
  orderId: string;
  initialOrder: OrderInfo;
  initialItems: OrderItemInfo[];
  menuItems: MenuItemInfo[];
}

export default function OrderEditForm({
  orderId,
  initialOrder,
  initialItems,
  menuItems,
}: Props) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(initialItems);
  const totalPrice = localItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const form = useForm<createOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      deliveryDate: initialOrder.deliveryDate
        ? new Date(initialOrder.deliveryDate)
        : undefined,
      comment: initialOrder.comment ?? "",
    },
  });

  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const handleAddItem = async (menuItemId: string, quantity: number) => {
    const optimisticItem: OrderItemInfo = {
      id: crypto.randomUUID(),
      quantity,
      price: 0,
      menuItem: menuItems.find((m) => m.id === menuItemId)!,
    };
    setLocalItems((prev) => [...prev, optimisticItem]);

    try {
      const result = await createOrderItem(null, {
        orderId,
        menuItemId,
        quantity,
      });
      if (result.success && result.data) {
        const created = result.data;
        setLocalItems((prev) =>
          prev.map((i) => (i.id === optimisticItem.id ? created : i)),
        );
        toast.success("Страву додано");
      } else if (!result.success && result.error) {
        setLocalItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        toast.error(result.error);
      }
    } catch (err: unknown) {
      setLocalItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
      toast.error(
        err instanceof Error ? err.message : "Не вдалося додати страву",
      );
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    const previousItems = localItems;
    setLocalItems((items) =>
      items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    );

    try {
      const result = await updateOrderItem(null, { id: itemId, quantity });
      if (result.success && result.data) {
        const updated = result.data;
        setLocalItems((items) =>
          items.map((i) => (i.id === itemId ? updated : i)),
        );
        toast.success("Кількість оновлено");
      } else if (!result.success && result.error) {
        setLocalItems(previousItems);
        toast.error(result.error);
      }
    } catch (err: unknown) {
      setLocalItems(previousItems);
      toast.error(
        err instanceof Error ? err.message : "Не вдалося оновити кількість",
      );
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const previousItems = localItems;
    setLocalItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      const result = await deleteOrderItem(null, { id: itemId });
      if (result.success) {
        toast.success("Позицію видалено");
      } else if (!result.success && result.error) {
        setLocalItems(previousItems);
        toast.error(result.error);
      }
    } catch (err: unknown) {
      setLocalItems(previousItems);
      toast.error(
        err instanceof Error ? err.message : "Не вдалося видалити позицію",
      );
    }
  };

  const handleSaveOrder = form.handleSubmit((data) => {
    startSave(async () => {
      const result = await updateOrder(null, {
        id: orderId,
        deliveryDate: data.deliveryDate
          ? new Date(
              data.deliveryDate.getFullYear(),
              data.deliveryDate.getMonth(),
              data.deliveryDate.getDate(),
              12,
              0,
              0,
            )
          : undefined,
        comment: data.comment,
      });

      if (result?.success) {
        toast.success("Замовлення збережено");
        router.push("/school/orders");
      } else {
        toast.error(result?.error ?? "Не вдалося зберегти");
        if (result?.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, msg]) => {
            form.setError(key as keyof createOrderInput, {
              message: msg?.join(", "),
            });
          });
        }
      }
    });
  });

  const handleDeleteOrder = () => {
    startDelete(async () => {
      const result = await deleteOrder(null, { id: orderId });

      if (result?.success) {
        toast.success("Замовлення повністю видалено");
        router.push("/school/orders");
      } else {
        toast.error(result?.error ?? "Не вдалося видалити");
      }
    });
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-10">
        <OrderHeader />

        <div className="space-y-6">
          <div className="flex justify-between items-center flex-col md:flex-row gap-4">
            <h3 className="text-xl font-semibold">Позиції замовлення</h3>
            <AddItemDialog menuItems={menuItems} onAdd={handleAddItem} />
          </div>
          {localItems.length === 0 ? (
            <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-12 text-center text-muted-foreground">
              Замовлення порожнє. Натисніть «Додати страву», щоб розпочати.
            </div>
          ) : (
            <div className="space-y-4">
              {localItems.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                  onRemove={() => handleRemoveItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 px-6 bg-muted/40 rounded-xl border">
          <span className="text-xl font-semibold">
            Загальна сума замовлення:
          </span>
          <span className="text-3xl font-bold text-primary mt-2 sm:mt-0">
            {totalPrice.toFixed(2)} грн
          </span>
        </div>

        <OrderActions
          onSave={handleSaveOrder}
          onDelete={handleDeleteOrder}
          isSubmitting={isSaving || isDeleting}
          disabled={localItems.length === 0}
        />
      </div>
    </FormProvider>
  );
}
