"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuItemInfo } from "@/features/menu-item/model/types";

interface Props {
  menuItems: MenuItemInfo[];
  onAdd: (menuItemId: string, quantity: number) => void;
}

export default function AddItemDialog({ menuItems, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MenuItemInfo | null>(null);
  const [quantity, setQuantity] = useState(1);

  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected && quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, [selected]);

  const handleAdd = () => {
    if (!selected) return;
    onAdd(selected.id, quantity);
    setOpen(false);
    setSelected(null);
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="Додати страву">
          <Plus className="mr-2 h-4 w-4" /> Додати страву
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Оберіть страву для замовлення</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "border rounded-xl p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md",
                selected?.id === item.id &&
                  "border-primary bg-primary/5 ring-2 ring-primary/20",
              )}
              onClick={() => {
                setSelected(item);
              }}
            >
              <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-muted">
                {item.images && item.images.length > 0 ? (
                  <Image
                    src={
                      item.images.find((img) => img.isPrimary)?.imageUrl ||
                      item.images[0].imageUrl
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Без фото
                  </div>
                )}
              </div>

              <h4 className="font-semibold line-clamp-2">{item.name}</h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {item.description || "Опис відсутній"}
              </p>
              <p className="font-bold mt-2">{item.price} грн</p>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-4 sm:gap-6 border-t pt-6">
          <div className="flex-1 space-y-2 sm:max-w-45">
            <Input
              ref={quantityInputRef}
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (value === "") {
                  setQuantity(1);
                  return;
                }
                const num = Number(value);
                if (!isNaN(num) && num >= 1 && num <= 100) {
                  setQuantity(num);
                }
              }}
            />
            {selected && (
              <p className="text-sm text-muted-foreground">
                Разом:{" "}
                <strong>{(selected.price * quantity).toFixed(2)} грн</strong>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
              aria-label="Скасувати додавання страви"
            >
              Скасувати
            </Button>
            <Button
              disabled={!selected}
              onClick={handleAdd}
              className="w-full sm:w-auto"
            >
              Додати в замовлення
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
