"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateCategoryInput } from "../model/types";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { updateCategorySchema } from "../model/schemas";
import { updateCategory } from "../api/actions";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  defaultValues: Partial<updateCategoryInput>;
};

export default function CategoryEditForm({ defaultValues }: Props) {
  const router = useRouter();

  const form = useForm<updateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    mode: "onChange",
    defaultValues: {
      id: defaultValues.id,
      name: defaultValues.name ?? "",
      description: defaultValues.description ?? "",
    },
  });

  const { setError } = form;

  const [state, formAction, isPending] = useActionState(updateCategory, null);

  useEffect(() => {
    if (!state) return;
    if (state.success && state.data) {
      toast.success("Категорія успішно оновлена");
      router.push("/admin/categories");
    } else if (state?.success === false && state.error) {
      toast.error(
        state.error ?? "Не вдалося оновити категорію. Спробуйте пізніше.",
      );
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof updateCategoryInput, {
            type: "server",
            message: messages?.join(", ") || "Помилка",
          });
        });
      }
    }
  }, [state, router, setError]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <div className="flex flex-col gap-6">
          <input type="hidden" {...form.register("id")} />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Назва</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Сніданки"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Опис</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Гарячі та поживні сніданкові страви"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            aria-label="Зберегти зміни в категорії"
          >
            Зберегти зміни
          </Button>
        </div>
      </form>
    </Form>
  );
}
