import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItemInfo } from "../model/types";

interface Props {
  items: MenuItemInfo[];
}

export default function MenuGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => {
        return (
          <Card
            key={item.id}
            className="flex-col gap-4 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {item.imageUrl ? (
              <div className="aspect-4/3 relative">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                  loading="eager"
                />
              </div>
            ) : (
              <div className="aspect-4/3 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Фото відсутнє</span>
              </div>
            )}

            <CardContent className="px-4 py-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {item.name}
                </h3>
                <Badge variant="secondary">
                  {new Intl.NumberFormat("uk-UA", {
                    style: "currency",
                    currency: "UAH",
                  }).format(item.price)}
                </Badge>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.category && (
                <p className="text-sm text-muted-foreground mt-2">
                  {item.category.name}
                </p>
              )}
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-0">
              <Badge
                variant={item.isAvailable ? "default" : "secondary"}
                className="text-xs"
              >
                {item.isAvailable ? "Доступний" : "Недоступний"}
              </Badge>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
