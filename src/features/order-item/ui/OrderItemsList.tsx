import { MenuItemInfo } from "@/features/menu-item";
import AddItemDialog from "./AddItemDialog";
import OrderItemRow from "./OrderItemRow";
import { OrderItemInfo } from "../model/order-item.types";

interface Props {
  items: OrderItemInfo[];
  menuItems: MenuItemInfo[];
  onAddItem: (menuItemId: string, quantity: number) => Promise<void>;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
}

export default function OrderItemsList({
  items,
  menuItems,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Позиції замовлення</h3>
        <AddItemDialog menuItems={menuItems} onAdd={onAddItem} />
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-12 text-center text-muted-foreground">
          Замовлення порожнє. Натисніть «Додати страву», щоб розпочати.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={(qty) => onUpdateQuantity(item.id, qty)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
