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
import { MenuItemInfo } from "@/features/menu-item/model/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

  const handleCancel = () => {
    setSelected(null);
    setQuantity(1);
  };

  const groupedItems = menuItems.reduce(
    (acc, item) => {
      const catName = item.category?.name ?? "Без категорії";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(item);
      return acc;
    },
    {} as Record<string, MenuItemInfo[]>,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="Додати страву">
          <Plus className="mr-2 h-4 w-4" /> Додати страву
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {selected
              ? `Додаємо: ${selected.name}`
              : "Оберіть страву для замовлення"}
          </DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b">
              <Command shouldFilter={true} className="overflow-visible">
                <CommandInput
                  placeholder="Пошук страви за назвою..."
                  className="h-12"
                  autoFocus
                />
                <CommandList className="max-h-[60vh] overflow-y-auto">
                  <CommandEmpty>
                    Нічого не знайдено за вашим запитом
                  </CommandEmpty>

                  {Object.entries(groupedItems).map(([categoryName, items]) => (
                    <CommandGroup
                      key={categoryName}
                      heading={categoryName}
                      className="p-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                          <CommandItem
                            key={item.id}
                            onSelect={() => setSelected(item)}
                            className="p-0 border rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer h-full"
                            value={item.name.toLowerCase()}
                          >
                            <div className="w-full h-full flex flex-col">
                              <div className="relative aspect-video md:aspect-square bg-muted">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                    Без фото
                                  </div>
                                )}
                              </div>

                              <div className="p-3 flex flex-col flex-1">
                                <h4 className="font-semibold line-clamp-2">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">
                                  {item.description || "Опис відсутній"}
                                </p>
                                <p className="font-bold mt-3">
                                  {item.price} грн
                                </p>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </div>
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 relative rounded-xl overflow-hidden border bg-muted shrink-0">
                {selected.imageUrl ? (
                  <Image
                    src={selected.imageUrl}
                    alt={selected.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Без фото
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{selected.name}</h3>
                  <p className="text-muted-foreground mt-1">
                    {selected.description || "Опис відсутній"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">{selected.price} грн</div>
                  <div className="text-xl font-medium">×</div>
                  <Input
                    ref={quantityInputRef}
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setQuantity(1);
                        return;
                      }
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 1 && num <= 100) {
                        setQuantity(num);
                      }
                    }}
                    className="w-24 text-center text-lg"
                  />
                  <div className="text-2xl font-bold">
                    = {(selected.price * quantity).toFixed(2)} грн
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleCancel}>
                Назад до вибору
              </Button>
              <Button onClick={handleAdd} disabled={quantity < 1}>
                Додати в замовлення
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Закрити
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
