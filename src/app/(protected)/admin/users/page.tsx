import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { OrganizationInfo } from "@/features/organization/model/types";
import { getAllUsers } from "@/features/user/model/queries";
import { getAllUsersSchema } from "@/features/user/model/schemas";
import { UsersList } from "@/features/user/model/types";
import UsersFilters from "@/features/user/ui/UsersFilters";
import UsersTable from "@/features/user/ui/UsersTable";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    name?: string;
    organizationId?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const paramsResolved = await searchParams;

  const query = {
    name: paramsResolved.name,
    organizationId: paramsResolved.organizationId,
    page: paramsResolved.page ? Number(paramsResolved.page) : 1,
    limit: paramsResolved.limit ? Number(paramsResolved.limit) : 10,
  };

  const parsedQuery = getAllUsersSchema.parse(query);

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new UnauthorizedError("Unauthorized");
  }

  const data: UsersList = await getAllUsers(parsedQuery, user);
  const organizations: OrganizationInfo[] = Array.from(
    new Map(
      data.users
        .map((u) => u.organization)
        .filter((org): org is OrganizationInfo => !!org)
        .map((org) => [
          org.id,
          {
            id: org.id,
            name: org.name,
            type: org.type,
            contactEmail: org?.contactEmail,
            contactPhone: org?.contactPhone,
          },
        ]),
    ).values(),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Управління користувачами
        </h1>
        <p className="text-muted-foreground mt-2">
          Перегляд, створення, редагування та видалення користувачів
        </p>
      </div>
      <Suspense
        fallback={<LoadingSpinner size="md" text="Завантаження фільтрів..." />}
      >
        <div className="max-w-3xl flex flex-row space-x-4 justify-between items-center">
          <Button
            asChild
            className="w-full sm:w-auto"
            aria-label="Додати користувача"
          >
            <Link href="/admin/users/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Додати користувача
            </Link>
          </Button>
          <UsersFilters
            currentParams={paramsResolved}
            organizations={organizations}
          />
        </div>
      </Suspense>
      <UsersTable users={data.users} />
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        totalItems={data.total}
        currentParams={paramsResolved}
      />
    </div>
  );
}
