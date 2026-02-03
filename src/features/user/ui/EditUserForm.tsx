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
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { updateUserInput } from "../model/types";
import { updateUserSchema } from "../model/schemas";
import { updateUser } from "../api/actions";
import { OrganizationSearchSelect } from "@/features/organization/ui/OrganizationSearchSelect";

type Props = {
  defaultValues: Partial<updateUserInput>;
};

export default function EditUserForm({ defaultValues }: Props) {
  const router = useRouter();

  const form = useForm<Partial<updateUserInput>>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    defaultValues: {
      id: defaultValues.id,
      email: defaultValues.email ?? "",
      firstName: defaultValues.firstName ?? "",
      lastName: defaultValues.lastName ?? "",
      avatarUrl: defaultValues.avatarUrl ?? "",
      organizationId: defaultValues.organizationId ?? "",
      password: "",
    },
  });

  const { setError } = form;

  const [state, formAction, isPending] = useActionState(updateUser, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Користувача успішно оновлено");
      router.push("/admin/users");
    } else if (state?.success === false && state.error) {
      toast.error(
        state.error ?? "Не вдалося оновити користувача. Спробуйте пізніше.",
      );
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof updateUserInput, {
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Електронна пошта</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="example@example.com"
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ім&apos;я</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="given-name"
                    placeholder="Петро"
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
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Прізвище</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="family-name"
                    placeholder="Петренко"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="********"
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
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Організація</FormLabel>
                <input
                  type="hidden"
                  name={field.name}
                  value={field.value ?? ""}
                />
                <OrganizationSearchSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Оберіть організацію..."
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            aria-label="Зберегти нового користувача"
          >
            Зберегти зміни
          </Button>
        </div>
      </form>
    </Form>
  );
}
