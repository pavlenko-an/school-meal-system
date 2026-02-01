"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationInfo } from "../model/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTransition } from "react";
import { deleteOrganization } from "../api/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  organizations: OrganizationInfo[];
  isLoading?: boolean;
}

const statusColors: Record<OrganizationInfo["type"], string> = {
  school: "bg-blue-100 text-blue-800",
  supplier: "bg-green-100 text-green-800",
};

export default function OrganizationsTable({
  organizations,
  isLoading = false,
}: Props) {
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Організацій не знайдено
      </div>
    );
  }

  const statusLabels: Record<OrganizationInfo["type"], string> = {
    school: "Школа",
    supplier: "Постачальник",
  };

  const handleDelete = (organizationId: string) => {
    startDelete(async () => {
      const result = await deleteOrganization(null, { id: organizationId });

      if (result?.success) {
        toast.success("Організацію повністю видалено");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося видалити організацію");
      }
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Назва</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((organization) => (
            <TableRow key={organization.id} className="hover:bg-muted/50">
              <TableCell>{organization.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[organization.type] || "bg-gray-100"}
                >
                  {statusLabels[organization.type]}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  disabled={isDeleting}
                  aria-label="Редагувати організацію"
                >
                  <Link href={`/admin/organizations/${organization.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Редагувати</span>
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting}
                      aria-label="Видалити організацію"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Видалити</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити організацію?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Цю дію неможливо скасувати. Усі пов&apos;язані
                        користувачі та дані будуть втрачені.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => handleDelete(organization.id)}
                        disabled={isDeleting}
                      >
                        Видалити
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
