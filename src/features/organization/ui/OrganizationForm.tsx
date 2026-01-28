"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateOrganizationInput } from "../model/types";
import { updateOrganizationSchema } from "../model/schemas";
import { updateOrganization } from "../api/actions";

interface Props {
  defaultValues: Partial<updateOrganizationInput>;
}

export default function OrganizationForm({ defaultValues }: Props) {
  const router = useRouter();

  const form = useForm<Partial<updateOrganizationInput>>({
    resolver: zodResolver(updateOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      name: defaultValues.name ?? "",
      contactEmail: defaultValues.contactEmail ?? "",
      contactPhone: defaultValues.contactPhone ?? "",
    },
  });

  const { setError, reset } = form;

  const [state, formAction, isPending] = useActionState(
    updateOrganization,
    null,
  );

  useEffect(() => {
    if (!state) return;

    if (state.success && state.data) {
      toast.success("Дані організації оновлено");
      reset(state.data);
      router.refresh();
    } else if (!state.success && state.error) {
      toast.error(
        state.error ?? "Не вдалося оновити організацію. Спробуйте пізніше.",
      );
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof updateOrganizationInput, {
            type: "server",
            message: messages?.join(", ") || "Помилка",
          });
        });
      }
    }
  }, [state, reset, router, setError]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <input type="hidden" {...field} value={defaultValues.id} />
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Назва організації</FormLabel>
                <FormControl>
                  <Input placeholder="Наприклад: ЗОШ №12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Контактний email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="school@example.com"
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
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Контактний телефон</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+380501234567"
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
          <Button type="submit" disabled={isPending}>
            {isPending ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
