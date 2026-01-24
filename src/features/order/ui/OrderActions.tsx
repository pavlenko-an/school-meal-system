import { Button } from "@/components/ui/button";
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
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDelete: () => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
}

export default function OrderActions({
  onSave,
  onPublish,
  onDelete,
  isSubmitting,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
      <Button
        size="lg"
        onClick={onSave}
        disabled={isSubmitting || disabled}
        className="flex-1"
      >
        {isSubmitting ? "Збереження..." : "Зберегти зміни"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="lg"
            variant="default"
            disabled={disabled}
            className="flex-1"
          >
            Опублікувати замовлення
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Опублікувати замовлення?</AlertDialogTitle>
            <AlertDialogDescription>
              Після публікації редагування буде заборонено. Постачальники
              побачать замовлення в списку.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={onPublish}>
              Опублікувати
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="lg" variant="destructive" className="flex-1">
            Видалити замовлення
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Замовлення буде видалено назавжди. Цю дію неможливо скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Видалити назавжди
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
