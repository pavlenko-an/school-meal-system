"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { updateMenuItemInput } from "../model/types";
import { updateMenuItem } from "../api/actions";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CategoryInfo } from "@/features/category/model/types";

interface Props {
  defaultValues: Partial<updateMenuItemInput>;
  categories: CategoryInfo[];
}

export default function MenuItemEditForm({ defaultValues, categories }: Props) {
  const router = useRouter();

  const form = useForm<updateMenuItemInput>({
    defaultValues: {
      id: defaultValues.id,
      name: defaultValues.name,
      description: defaultValues.description ?? "",
      price: defaultValues.price,
      isAvailable: defaultValues.isAvailable,
      categoryId: defaultValues.categoryId ?? "",
    },
  });

  const { setError } = form;

  const [state, formAction, isPending] = useActionState(updateMenuItem, null);

  useEffect(() => {
    if (!state) return;
    if (state.success && state.data) {
      toast.success("Пункт меню успішно оновлено");
      router.push("/admin/menu-items");
    } else if (state?.success === false && state.error) {
      toast.error(
        state.error ?? "Не вдалося оновити пункт меню. Спробуйте пізніше.",
      );
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof updateMenuItemInput, {
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
                    placeholder="Суп з локшиною"
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
                    placeholder="Гарячий суп з локшиною та овочами"
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ціна (грн)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="99.99"
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Категорія (необов’язково)</FormLabel>
                <input
                  type="hidden"
                  name={field.name}
                  value={field.value ?? ""}
                />
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть категорію" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3 space-y-0">
                <input
                  type="hidden"
                  name={field.name}
                  value={field.value ? "true" : "false"}
                />
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
                <div>
                  <FormLabel className="cursor-pointer">
                    Доступний для замовлення
                  </FormLabel>
                  <FormDescription>
                    Якщо вимкнено, пункт не відображатиметься в меню
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            aria-label="Зберегти нову організацію"
          >
            Зберегти зміни
          </Button>
        </div>
      </form>
    </Form>
  );
}
