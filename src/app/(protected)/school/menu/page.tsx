import { Card, CardContent } from "@/components/ui/card";
import MenuCategoryTabs from "@/features/category/ui/MenuCategoryTabs";
import MenuGrid from "@/features/menu-item/ui/MenuGrid";
import { CategoryInfo, getAllCategories } from "@/features/category";
import {
  MenuItemsInfo,
  getAllMenuItems,
  getAllMenuItemsSchema,
} from "@/features/menu-item";

export default async function SchoolMenuPage({
  searchParams,
}: {
  searchParams?: Promise<{ categoryId?: string }>;
}) {
  const params = await searchParams;
  let parsedQuery;
  try {
    parsedQuery = getAllMenuItemsSchema.parse(params || {});
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Недійсні параметри запиту");
    }
  }

  const categoryId =
    parsedQuery.categoryId && parsedQuery.categoryId !== "all"
      ? parsedQuery.categoryId
      : undefined;

  let categories: CategoryInfo[] = [];
  let menuItems: MenuItemsInfo[] = [];
  try {
    [categories, menuItems] = await Promise.all([
      getAllCategories({ limit: 20 }),
      getAllMenuItems({ ...parsedQuery, categoryId, isAvailable: true }),
    ]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Не вдалося завантажити категорії або пункти меню");
    }
  }

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
