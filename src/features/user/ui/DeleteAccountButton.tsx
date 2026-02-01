"use client";

import { useTransition } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { deleteUser } from "../api/actions";

export default function DeleteAccountSection() {
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () => {
    startDelete(async () => {
      const result = await deleteUser();
      if (result?.success) {
        toast.success("Обліковий запис видалено");
        await signOut({ callbackUrl: "/" });
      } else {
        toast.error(result?.error ?? "Не вдалося видалити обліковий запис");
      }
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Після видалення облікового запису всі ваші дані (замовлення, історія)
        буде безповоротно втрачено.
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={isDeleting}
            aria-label="Видалити обліковий запис"
          >
            {isDeleting ? "Видалення..." : "Видалити обліковий запис"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви абсолютно впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Ця дія <strong>необоротна</strong>. Після підтвердження ваш
              обліковий запис, усі пов&apos;язані дані та історія будуть
              остаточно видалені.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Скасувати
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Видаляємо..." : "Видалити назавжди"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
