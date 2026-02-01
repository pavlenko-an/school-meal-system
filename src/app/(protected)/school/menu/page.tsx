import { Card, CardContent } from "@/components/ui/card";
import MenuCategoryTabs from "@/features/category/ui/MenuCategoryTabs";
import MenuGrid from "@/features/menu-item/ui/MenuGrid";
import { getAllMenuItemsSchema } from "@/features/menu-item/model/schemas";
import { MenuItemInfo } from "@/features/menu-item/model/types";
import { getAllMenuItems } from "@/features/menu-item/model/queries";
import { CategoryInfo } from "@/features/category/model/types";
import { getAllCategories } from "@/features/category/model/queries";

interface Props {
  searchParams?: Promise<{ categoryId?: string }>;
}

export default async function SchoolMenuPage({ searchParams }: Props) {
  const params = await searchParams;
  const menuQuery = getAllMenuItemsSchema.parse(params || {});

  const categoryId =
    menuQuery.categoryId && menuQuery.categoryId !== "all"
      ? menuQuery.categoryId
      : undefined;

  const [categories, menuItems]: [CategoryInfo[], MenuItemInfo[]] =
    await Promise.all([
      getAllCategories({ limit: 20 }),
      getAllMenuItems({ ...menuQuery, categoryId, isAvailable: true }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Меню</h1>
        <p className="text-muted-foreground mt-2">
          Доступні страви для формування замовлень
        </p>
      </div>
      <MenuCategoryTabs categories={categories} />
      <MenuGrid items={menuItems} />
      {menuItems.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              На даний момент меню порожнє або всі страви недоступні.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
