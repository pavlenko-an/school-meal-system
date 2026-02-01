"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserInfo } from "../model/types";
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
import { deleteUser } from "../api/actions";

interface Props {
  users: UserInfo[];
  isLoading?: boolean;
}
export default function UsersTable({ users, isLoading = false }: Props) {
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

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Користувачів не знайдено
      </div>
    );
  }

  const handleDelete = (userId: string) => {
    startDelete(async () => {
      const result = await deleteUser(null, { id: userId });

      if (result?.success) {
        toast.success("Користувача повністю видалено");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося видалити користувача");
      }
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ім&apos;я</TableHead>
            <TableHead>Прізвище</TableHead>
            <TableHead>Електронна пошта</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Організація</TableHead>
            <TableHead>Тип організації</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.organization?.name}</TableCell>
              <TableCell>{user.organization?.type}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  disabled={isDeleting}
                  aria-label="Редагувати користувача"
                >
                  <Link href={`/admin/users/${user.id}/edit`}>
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
                      aria-label="Видалити користувача"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Видалити</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити користувача?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Цю дію неможливо скасувати. Усі пов&apos;язані дані
                        будуть втрачені.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => handleDelete(user.id)}
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
