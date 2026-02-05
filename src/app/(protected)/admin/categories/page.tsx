import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/features/category/model/queries";
import { getAllCategoriesSchema } from "@/features/category/model/schemas";
import { CategoriesList } from "@/features/category/model/types";
import CategoriesFilters from "@/features/category/ui/CategoriesFilters";
import CategoriesTable from "@/features/category/ui/CategoriesTable";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    name?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const query = {
    name: paramsResolved.name,
    page: paramsResolved.page ? Number(paramsResolved.page) : 1,
    limit: paramsResolved.limit ? Number(paramsResolved.limit) : 10,
  };

  const parsedQuery = getAllCategoriesSchema.parse(query);

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const data: CategoriesList = await getAllCategories(parsedQuery);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Управління категоріями
        </h1>
        <p className="text-muted-foreground mt-2">
          Перегляд, створення, редагування та видалення категорій
        </p>
      </div>
      <Suspense
        fallback={<LoadingSpinner size="md" text="Завантаження фільтрів..." />}
      >
        <div className="max-w-2xl flex flex-row space-x-4 justify-between items-center">
          <Button
            asChild
            className="w-full sm:w-auto"
            aria-label="Додати категорію"
          >
            <Link href="/admin/categories/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Додати категорію
            </Link>
          </Button>
          <CategoriesFilters currentParams={paramsResolved} />
        </div>
      </Suspense>
      <CategoriesTable categories={data.categories} />
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        totalItems={data.total}
        currentParams={paramsResolved}
      />
    </div>
  );
}
