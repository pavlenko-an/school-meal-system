import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { getAllOrganizations } from "@/features/organization/model/queries";
import { OrganizationsList } from "@/features/organization/model/types";
import OrganizationsFilters from "@/features/organization/ui/OrganizationsFilters";
import OrganizationsTable from "@/features/organization/ui/OrganizationsTable";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    name?: string;
    type?: "school" | "supplier";
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminOrganizationsPage({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const query = {
    name: paramsResolved.name,
    type: paramsResolved.type,
    page: paramsResolved.page ? Number(paramsResolved.page) : 1,
    limit: paramsResolved.limit ? Number(paramsResolved.limit) : 10,
  };

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const data: OrganizationsList = await getAllOrganizations(query);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Управління організаціями
        </h1>
        <p className="text-muted-foreground mt-2">
          Перегляд, створення, редагування та видалення організацій
        </p>
      </div>
      <Suspense
        fallback={<LoadingSpinner size="md" text="Завантаження фільтрів..." />}
      >
        <div className="max-w-3xl w-full flex flex-col sm:flex-row sm:space-x-4 sm:justify-between items-center gap-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/organizations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Додати організацію
            </Link>
          </Button>
          <OrganizationsFilters currentParams={paramsResolved} />
        </div>
      </Suspense>
      <OrganizationsTable organizations={data.organizations} />
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        totalItems={data.total}
        currentParams={paramsResolved}
      />
    </div>
  );
}
