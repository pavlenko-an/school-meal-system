"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CategoryInfo } from "../model/types";
import { deleteCategory } from "../api/actions";

interface Props {
  categories: CategoryInfo[];
  isLoading?: boolean;
}

export default function CategoriesTable({
  categories,
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

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Категорій не знайдено
      </div>
    );
  }

  const handleDelete = (categoryId: string) => {
    startDelete(async () => {
      const result = await deleteCategory(null, { id: categoryId });

      if (result?.success) {
        toast.success("Категорію повністю видалено");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося видалити категорію");
      }
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Назва</TableHead>
            <TableHead>Опис</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id} className="hover:bg-muted/50">
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  disabled={isDeleting}
                  aria-label="Редагувати категорію"
                >
                  <Link href={`/admin/categories/${category.id}/edit`}>
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
                      aria-label="Видалити категорію"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Видалити</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити категорію?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Цю дію неможливо скасувати. Усі пов&apos;язані дані
                        будуть втрачені.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => handleDelete(category.id)}
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
