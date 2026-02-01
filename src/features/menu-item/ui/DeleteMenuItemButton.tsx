"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { deleteMenuItem } from "../api/actions";

interface Props {
  menuItemId: string;
}

export default function DeleteMenuItemButton({ menuItemId }: Props) {
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () => {
    startDelete(async () => {
      const result = await deleteMenuItem(null, { id: menuItemId });
      if (result?.success) {
        toast.success("Пункт меню видалено");
        router.refresh();
      } else {
        toast.error(result?.error ?? "Не вдалося видалити пункт меню");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive/90 border-destructive/30 hover:border-destructive/50"
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Видалити
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Видалити пункт меню?</AlertDialogTitle>
          <AlertDialogDescription>
            Ця дія буде незворотною. Пункт меню та всі пов&apos;язані з ним дані
            (включаючи фото) буде видалено назавжди.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Скасувати</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Видалити назавжди
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
