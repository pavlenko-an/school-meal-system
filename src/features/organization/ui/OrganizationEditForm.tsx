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
import { updateOrganizationInput } from "../model/types";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { updateOrganizationSchema } from "../model/schemas";
import { updateOrganization } from "../api/actions";

type Props = {
  defaultValues: Partial<updateOrganizationInput>;
};

export default function OrganizationEditForm({ defaultValues }: Props) {
  const router = useRouter();

  const form = useForm<updateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      id: defaultValues.id,
      name: defaultValues.name ?? "",
      contactEmail: defaultValues.contactEmail ?? "",
      contactPhone: defaultValues.contactPhone ?? "",
    },
  });

  const { setError } = form;

  const [state, formAction, isPending] = useActionState(
    updateOrganization,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success && state.data) {
      toast.success("Організація успішно оновлена");
      router.push("/admin/organizations");
    } else if (state?.success === false && state.error) {
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
                    placeholder="Global Suppliers Ltd."
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
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Електронна пошта</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email"
                    placeholder="contact@globalsuppliers.com"
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
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="tel"
                    placeholder="+1 (555) 123-4567"
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
            aria-label="Зберегти зміни в організації"
          >
            Зберегти зміни
          </Button>
        </div>
      </form>
    </Form>
  );
}
