import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Props {
  item: any;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function OrderItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border rounded-lg p-4 bg-card">
      {item.menuItem?.images?.find((i: any) => i.isPrimary)?.imageUrl && (
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0">
          <Image
            src={item.menuItem.images.find((i: any) => i.isPrimary)!.imageUrl}
            alt={item.menuItem.name}
            width={96}
            height={96}
            className="rounded object-cover w-full h-full"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-medium text-lg">
          {item.menuItem?.name || "Без назви"}
        </div>
        {item.menuItem?.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.menuItem.description}
          </p>
        )}
      </div>

      <div className="w-24 sm:w-28">
        <Input
          type="number"
          min={1}
          max={100}
          value={item.quantity}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 1 && val <= 100) {
              onUpdateQuantity(val);
            }
          }}
          className="text-center"
        />
      </div>

      <div className="w-28 text-right font-medium">
        {(item.price * item.quantity).toFixed(2)} грн
      </div>

      <Button variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="h-5 w-5 text-destructive" />
      </Button>
    </div>
  );
}
