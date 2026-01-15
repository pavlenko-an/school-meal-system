"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteUserApi } from "@/features/user/lib/api";
import { useRouter } from "next/navigation";
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

export default function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUserApi();
      toast.success("Обліковий запис видалено");
      router.push("/auth/login");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Не вдалося видалити обліковий запис"
      );
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Після видалення облікового запису всі ваші дані (замовлення, історія)
        буде безповоротно втрачено.
      </p>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isDeleting}>
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
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
