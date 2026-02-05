import { Card, CardContent } from "@/components/ui/card";
import MenuCategoryTabs from "@/features/category/ui/MenuCategoryTabs";
import MenuGrid from "@/features/menu-item/ui/MenuGrid";
import { getAllMenuItems } from "@/features/menu-item/model/queries";
import { getAllCategories } from "@/features/category/model/queries";
import Pagination from "@/components/common/Pagination";
import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MenuItemsFilters from "@/features/menu-item/ui/MenuItemsFilters";

interface Props {
  searchParams: Promise<{
    categoryId?: string;
    name?: string;
    isAvailable?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function SchoolMenuPage({ searchParams }: Props) {
  const params = await searchParams;

  const query = {
    categoryId:
      params?.categoryId && params.categoryId !== "all"
        ? params.categoryId
        : undefined,
    name: params?.name,
    isAvailable: params?.isAvailable ? Boolean(params.isAvailable) : undefined,
    page: params?.page ? Number(params.page) : 1,
    limit: params?.limit ? Number(params.limit) : 10,
  };

  const [catData, menuData] = await Promise.all([
    getAllCategories({ limit: 20 }),
    getAllMenuItems(query),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Меню</h1>
        <p className="text-muted-foreground mt-2">
          Доступні страви для формування замовлень
        </p>
      </div>
      <MenuCategoryTabs categories={catData.categories} />
      <Suspense
        fallback={<LoadingSpinner size="md" text="Завантаження фільтрів..." />}
      >
        <div className="w-full flex justify-center">
          <MenuItemsFilters currentParams={params} />
        </div>
      </Suspense>
      <MenuGrid items={menuData.items} />
      {menuData.items.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              На даний момент меню порожнє або всі страви недоступні.
            </p>
          </CardContent>
        </Card>
      )}
      <Pagination
        currentPage={menuData.page}
        totalPages={menuData.totalPages}
        totalItems={menuData.total}
        currentParams={params}
      />
    </div>
  );
}
