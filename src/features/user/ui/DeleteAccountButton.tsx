"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { signOut } from "next-auth/react";
import { deleteUser } from "../api/actions";

export default function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteUser, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Обліковий запис видалено");
      signOut({ redirect: false }).then(() => {
        router.push("/auth/login");
      });
    }
    if (state?.success === false && state.error) {
      toast.error(state.error);
      setTimeout(() => setOpen(false), 0);
    }
  }, [state, router]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Після видалення облікового запису всі ваші дані (замовлення, історія)
        буде безповоротно втрачено.
      </p>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={isPending}
            aria-label="Видалити обліковий запис"
          >
            {isPending ? "Видалення..." : "Видалити обліковий запис"}
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
            <AlertDialogCancel disabled={isPending}>
              Скасувати
            </AlertDialogCancel>
            <form action={formAction}>
              <AlertDialogAction
                type="submit"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isPending}
              >
                {isPending ? "Видаляємо..." : "Видалити назавжди"}
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
