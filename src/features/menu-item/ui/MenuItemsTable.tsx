"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { MenuItemInfo } from "../model/types";
import { useTransition } from "react";
import { deleteMenuItem } from "../api/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface Props {
  menuItems: MenuItemInfo[];
  isLoading?: boolean;
}

export default function MenuItemsTable({
  menuItems,
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

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Пунктів меню не знайдено
      </div>
    );
  }

  const handleDelete = (menuItemId: string) => {
    startDelete(async () => {
      const result = await deleteMenuItem(null, { id: menuItemId });

      if (result?.success) {
        toast.success("Пункт меню повністю видалено");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося видалити пункт меню");
      }
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Зображення</TableHead>
            <TableHead>Ім&apos;я</TableHead>
            <TableHead>Категорія</TableHead>
            <TableHead>Опис</TableHead>
            <TableHead>Ціна</TableHead>
            <TableHead>Наявність</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((menuItem) => (
            <TableRow key={menuItem.id} className="hover:bg-muted/50">
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={menuItem.imageUrl ?? undefined} />
                  <AvatarFallback>{menuItem.name?.[0] || "M"}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{menuItem.name}</TableCell>
              <TableCell>{menuItem.category?.name}</TableCell>
              <TableCell>{menuItem.description}</TableCell>
              <TableCell>{menuItem.price.toFixed(2)} грн</TableCell>
              <TableCell>
                <Badge
                  variant={menuItem.isAvailable ? "default" : "secondary"}
                  className="text-xs"
                >
                  {menuItem.isAvailable ? "Доступний" : "Недоступний"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  disabled={isDeleting}
                  aria-label="Редагувати пункт меню"
                >
                  <Link href={`/admin/menu-items/${menuItem.id}/edit`}>
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
                      aria-label="Видалити пункт меню"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Видалити</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити пункт меню?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Цю дію неможливо скасувати. Усі пов&apos;язані дані
                        будуть втрачені.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => handleDelete(menuItem.id)}
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
