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
import { updateUserInput } from "../model/types";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { updateUserSchema } from "../model/schemas";
import { updateUser } from "../api/actions";

type Props = {
  defaultValues: Partial<updateUserInput>;
};

export default function ProfileForm({ defaultValues }: Props) {
  const router = useRouter();

  const form = useForm<Partial<updateUserInput>>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    defaultValues: {
      firstName: defaultValues.firstName ?? "",
      lastName: defaultValues.lastName ?? "",
      email: defaultValues.email ?? "",
      password: "",
    },
  });

  const { setError, reset } = form;

  const [state, formAction, isPending] = useActionState(updateUser, null);

  useEffect(() => {
    if (!state) return;
    if (state.success && state.data) {
      toast.success("Профіль успішно оновлено");
      reset(state.data);
      router.refresh();
    } else if (state?.success === false && state.error) {
      toast.error(
        state.error ?? "Не вдалося оновити профіль. Спробуйте пізніше.",
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
  }, [state, router, setError, reset]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ім&apos;я</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Іван"
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
                    placeholder="Петров"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Електронна пошта</FormLabel>
                <FormControl>
                  <Input placeholder="example@example.com" {...field} />
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
                <FormLabel>Новий пароль</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
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
            aria-label="Зберегти зміни в профілі"
          >
            Зберегти зміни
          </Button>
        </div>
      </form>
    </Form>
  );
}
