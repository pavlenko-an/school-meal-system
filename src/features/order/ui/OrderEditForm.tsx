"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import OrderHeader from "./OrderHeader";
import OrderActions from "./OrderActions";
import { updateOrder } from "../actions/update-order.action";
import { createOrderItem } from "@/features/order-item/actions/create-order-item.action";
import { updateOrderItem } from "@/features/order-item/actions/update-order-item.action";
import { deleteOrderItem } from "@/features/order-item/actions/delete-order-item.action";
import { updateOrderStatus } from "../actions/update-order-status.action";
import { deleteOrder } from "../actions/delete-order.action";
import { MenuItemInfo } from "@/features/menu-item";
import { OrderItemInfo } from "@/features/order-item";
import { createOrderInput, OrderInfo } from "../model/order.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderSchema } from "../model/create-order.schema";
import AddItemDialog from "@/features/order-item/ui/AddItemDialog";
import OrderItemRow from "@/features/order-item/ui/OrderItemRow";

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

  const form = useForm<createOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      deliveryDate: initialOrder.deliveryDate
        ? new Date(initialOrder.deliveryDate)
        : undefined,
      comment: initialOrder.comment ?? "",
    },
  });

  const totalPrice = localItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const [saveState, saveAction, isSavePending] = useActionState(
    updateOrder,
    null,
  );
  const [publishState, publishAction, isPublishPending] = useActionState(
    updateOrderStatus,
    null,
  );
  const [deleteOrderState, deleteOrderAction, isDeleteOrderPending] =
    useActionState(deleteOrder, null);

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
      if (result.success) {
        setLocalItems((prev) =>
          prev.map((i) => (i.id === optimisticItem.id ? result.data : i)),
        );
        toast.success("Страву додано");
      } else {
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
      await updateOrderItem(null, { id: itemId, quantity });
      toast.success("Кількість оновлено");
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
      await deleteOrderItem(null, { id: itemId });
      toast.success("Позицію видалено");
    } catch (err: unknown) {
      setLocalItems(previousItems);
      toast.error(
        err instanceof Error ? err.message : "Не вдалося видалити позицію",
      );
    }
  };

  const handleSaveOrder = () => {
    startTransition(() => {
      saveAction({ id: orderId, ...form.getValues() });
    });
  };

  const handlePublishOrder = () => {
    startTransition(() => {
      publishAction({ id: orderId, status: "published" });
    });
  };

  const handleDeleteOrder = () => {
    startTransition(() => {
      deleteOrderAction({ id: orderId });
    });
  };

  useEffect(() => {
    if (saveState?.success) {
      toast.success("Замовлення збережено!");
      router.push("/school/orders");
    } else if (saveState?.success === false && saveState.error) {
      toast.error(saveState.error);
    }
  }, [saveState, router]);

  useEffect(() => {
    if (publishState?.success) {
      toast.success("Замовлення опубліковано!");
      router.push("/school/orders");
    } else if (publishState?.success === false && publishState.error) {
      toast.error(publishState.error);
    }
  }, [publishState, router]);

  useEffect(() => {
    if (deleteOrderState?.success) {
      toast.success("Замовлення видалено");
      router.push("/school/orders");
    } else if (deleteOrderState?.success === false && deleteOrderState.error) {
      toast.error(deleteOrderState.error);
    }
  }, [deleteOrderState, router]);

  return (
    <div className="space-y-10">
      <OrderHeader form={form} />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
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
        <span className="text-xl font-semibold">Загальна сума замовлення:</span>
        <span className="text-3xl font-bold text-primary mt-2 sm:mt-0">
          {totalPrice.toLocaleString("uk-UA", {
            style: "currency",
            currency: "UAH",
          })}
        </span>
      </div>

      <OrderActions
        onSave={handleSaveOrder}
        onPublish={handlePublishOrder}
        onDelete={handleDeleteOrder}
        isSubmitting={isSavePending || isPublishPending || isDeleteOrderPending}
        disabled={localItems.length === 0}
      />
    </div>
  );
}
