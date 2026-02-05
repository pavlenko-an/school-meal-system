import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { OrderItemInfo } from "../model/types";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  item: OrderItemInfo;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function OrderItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: Props) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isPending, setIsPending] = useState(false);
  const prevQuantityRef = useRef(item.quantity);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleQuantityChange = (value: string) => {
    const num = Number(value);
    if (isNaN(num) || num < 1) {
      setLocalQuantity(1);
      return;
    }
    if (num > 100) return;

    const newQuantity = Math.min(100, num);
    setLocalQuantity(newQuantity);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (newQuantity === prevQuantityRef.current) return;

      setIsPending(true);
      const previous = prevQuantityRef.current;

      try {
        onUpdateQuantity(newQuantity);
        prevQuantityRef.current = newQuantity;
      } catch (err: unknown) {
        setLocalQuantity(previous);
        toast.error(
          err instanceof Error ? err.message : "Не вдалося оновити кількість",
        );
      } finally {
        setIsPending(false);
      }
    }, 500);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-start sm:items-center border rounded-lg p-4 bg-card transition-opacity",
      )}
    >
      {item.menuItem?.imageUrl ? (
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
          <Image
            src={item.menuItem?.imageUrl || ""}
            alt={item.menuItem?.name || "Страва"}
            width={96}
            height={96}
            className="object-cover w-full h-full"
            priority={false}
            unoptimized
          />
        </div>
      ) : (
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
          Без фото
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
          value={localQuantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          disabled={isPending}
          className={cn("text-center", isPending && "opacity-70 animate-pulse")}
          aria-label={`Кількість для ${item.menuItem?.name || "страви"}`}
        />
      </div>

      <div className="w-28 text-right font-medium">
        {(item.price * localQuantity).toFixed(2)} грн
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label="Видалити страву з замовлення"
      >
        <Trash2 className="h-5 w-5 text-destructive" />
      </Button>
    </div>
  );
}
