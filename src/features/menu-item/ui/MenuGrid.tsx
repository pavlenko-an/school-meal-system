import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItemsInfo } from "../model/menu-item.types";

export default function MenuGrid({ items }: { items: MenuItemsInfo[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => {
        const primaryImage = item.images?.find((img) => img.isPrimary);

        return (
          <Card
            key={item.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            {primaryImage ? (
              <div className="aspect-4/3 relative">
                <Image
                  src={primaryImage.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : (
              <div className="aspect-4/3 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Фото отсутствует</span>
              </div>
            )}

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                <Badge variant="secondary">{item.price} грн</Badge>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.category && (
                <p className="text-xs text-muted-foreground mt-2">
                  {item.category.name}
                </p>
              )}
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-0">
              {item.isAvailable ? (
                <span className="text-xs text-muted-foreground">Доступно</span>
              ) : (
                <span className="text-xs text-destructive">Недоступно</span>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
