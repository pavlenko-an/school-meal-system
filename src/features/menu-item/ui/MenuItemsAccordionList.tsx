import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MenuItemInfo } from "../model/types";
import DeleteMenuItemButton from "./DeleteMenuItemButton";

interface Props {
  menuItems: MenuItemInfo[];
  isLoading?: boolean;
}

export default function MenuItemsAccordionList({
  menuItems,
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30">
        Пунктів меню не знайдено
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-4">
      {menuItems.map((item) => {
        return (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border rounded-lg overflow-hidden data-[state=open]:border-primary/40 shadow-sm"
          >
            <AccordionTrigger className="flex items-center hover:no-underline px-5 py-4 bg-muted/20 hover:bg-muted/40 transition-colors border-b border-gray-200 data-[state=open]:border-b-0">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                <div>
                  {item.imageUrl ? (
                    <div className="relative h-14 w-14 rounded-md overflow-hidden border bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.name || "Пункт меню"}
                        fill
                        className="object-cover"
                        sizes="56px"
                        loading="lazy"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      немає фото
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>{item.category?.name || "Без категорії"}</span>
                    <Badge
                      variant={item.isAvailable ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.isAvailable ? "Доступний" : "Недоступний"}
                    </Badge>
                    <span className="font-medium">
                      {item.price.toLocaleString("uk-UA", {
                        style: "currency",
                        currency: "UAH",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-5 pb-6 pt-3 bg-background">
              <div className="space-y-6">
                {item.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1.5">
                      Опис
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}

                {item.imageUrl ? (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      <div className="relative aspect-square rounded-md overflow-hidden border bg-muted group">
                        <Image
                          src={item.imageUrl}
                          alt={`${item.name} - фото`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-6">
                    Фотографій для цього пункту меню немає
                  </p>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/menu-items/${item.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Редагувати
                    </Link>
                  </Button>

                  <DeleteMenuItemButton menuItemId={item.id} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
