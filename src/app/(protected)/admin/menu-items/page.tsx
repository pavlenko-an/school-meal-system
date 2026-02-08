import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/features/category/model/queries";
import MenuCategoryTabs from "@/features/category/ui/MenuCategoryTabs";
import { getAllMenuItems } from "@/features/menu-item/model/queries";
import MenuItemsAccordionList from "@/features/menu-item/ui/MenuItemsTable";
import MenuItemsFilters from "@/features/menu-item/ui/MenuItemsFilters";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    categoryId?: string;
    name?: string;
    isAvailable?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminMenuItemsPage({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const query = {
    categoryId: paramsResolved.categoryId,
    name: paramsResolved.name,
    isAvailable: paramsResolved.isAvailable
      ? Boolean(paramsResolved.isAvailable)
      : undefined,
    page: paramsResolved.page ? Number(paramsResolved.page) : 1,
    limit: paramsResolved.limit ? Number(paramsResolved.limit) : 10,
  };

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const [itemsData, catData] = await Promise.all([
    getAllMenuItems(query),
    getAllCategories({ limit: 25 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Управління пунктами меню
        </h1>
        <p className="text-muted-foreground mt-2">
          Перегляд, створення, редагування та видалення пунктів меню
        </p>
      </div>
      <MenuCategoryTabs categories={catData.categories} />
      <Suspense
        fallback={<LoadingSpinner size="md" text="Завантаження фільтрів..." />}
      >
        <div className="max-w-2xl w-full flex flex-col sm:flex-row sm:space-x-4 sm:justify-between items-center gap-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/menu-items/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Додати пункт меню
            </Link>
          </Button>
          <MenuItemsFilters currentParams={paramsResolved} />
        </div>
      </Suspense>
      <MenuItemsAccordionList menuItems={itemsData.items} />
      <Pagination
        currentPage={itemsData.page}
        totalPages={itemsData.totalPages}
        totalItems={itemsData.total}
        currentParams={paramsResolved}
      />
    </div>
  );
}
