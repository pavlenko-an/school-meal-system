"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import OrderHeader from "./OrderHeader";
import OrderItemsList from "@/features/order-item/ui/OrderItemsList";
import OrderSummary from "./OrderSummary";
import OrderActions from "./OrderActions";
import { updateOrder } from "../actions/update-order.action";
import { createOrderItem } from "@/features/order-item/actions/create-order-item.action";
import { updateOrderItem } from "@/features/order-item/actions/update-order-item.action";
import { deleteOrderItem } from "@/features/order-item/actions/delete-order-item.action";
import { updateOrderStatus } from "../actions/update-order-status.action";
import { deleteOrder } from "../actions/delete-order.action";
import { MenuItemInfo } from "@/features/menu-item";
import { OrderItemInfo } from "@/features/order-item";
import { createOrderInput, OrderDetails } from "../model/order.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderSchema } from "../model/create-order.schema";

interface Props {
  orderId: string;
  initialOrder: OrderDetails;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const deliveryDate = form.getValues("deliveryDate");
      if (!deliveryDate || isNaN(deliveryDate.getTime())) {
        toast.error("Оберіть коректну дату поставки");
        setIsSubmitting(false);
        return;
      }
      const result = await updateOrder(null, {
        id: orderId,
        deliveryDate,
        comment: form.getValues("comment") || "",
      });
      if (!result.success) {
        toast.error(result.error || "Помилка при збереженні замовлення");
        return;
      }
      toast.success("Замовлення збережено!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Не вдалося зберегти замовлення");
      }
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  const handleAddItem = async (menuItemId: string, quantity: number) => {
    try {
      const result = await createOrderItem(null, {
        orderId,
        menuItemId,
        quantity,
      });
      if (!result.success) {
        toast.error(result.error || "Помилка при додаванні");
        return;
      }
      setLocalItems((prev) => [...prev, result.data]);
      toast.success("Страву додано");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Не вдалося додати страву");
      }
    } finally {
      router.refresh();
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      const result = await updateOrderItem(null, {
        id: itemId,
        quantity,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setLocalItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...result.data } : item,
        ),
      );
      toast.success("Кількість оновлено");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Не вдалося оновити кількість");
      }
    } finally {
      router.refresh();
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const result = await deleteOrderItem(null, {
        id: itemId,
      });
      if (!result.success) {
        toast.error(result.error || "Помилка при видаленні");
        return;
      }
      setLocalItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Позицію видалено");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Не вдалося видалити позицію");
      }
    } finally {
      router.refresh();
    }
  };

  const handlePublish = async () => {
    try {
      const result = await updateOrderStatus(null, {
        id: orderId,
        status: "published",
      });
      if (!result.success) {
        toast.error(result.error || "Помилка при публікації замовлення");
        return;
      }
      toast.success("Замовлення опубліковано!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Не вдалося опублікувати замовлення");
      }
    } finally {
      router.push("/school/orders");
      router.refresh();
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const result = await deleteOrder(null, { id: orderId });
      if (!result.success) {
        toast.error(result.error || "Помилка при видаленні замовлення");
        return;
      }
      toast.success("Замовлення видалено");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Не вдалося видалити замовлення");
      }
    } finally {
      router.push("/school/orders");
      router.refresh();
    }
  };

  return (
    <div className="space-y-10">
      <OrderHeader form={form} />
      <OrderItemsList
        items={localItems}
        menuItems={menuItems}
        onAddItem={handleAddItem}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
      <OrderSummary totalPrice={totalPrice} />
      <OrderActions
        onSave={handleSave}
        onPublish={handlePublish}
        onDelete={handleDeleteOrder}
        isSubmitting={isSubmitting}
        disabled={localItems.length === 0}
      />
    </div>
  );
}
