"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateUserApi } from "../lib/api";
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
import { updateUserFormInput } from "../model/user.types";
import { updateUserFormSchema } from "../model/update-user.schema";
import { useRouter } from "next/navigation";

type Props = {
  defaultValues?: Partial<updateUserFormInput>;
};

export default function ProfileForm({ defaultValues }: Props) {
  const router = useRouter();

  const form = useForm<updateUserFormInput>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      email: defaultValues?.email || "",
      password: "",
    },
  });

  const onSubmit = async (data: updateUserFormInput) => {
    try {
      await updateUserApi(data);
      toast.success("Профіль успішно оновлено");
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Не вдалося оновити профіль"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ім&apos;я</FormLabel>
                <FormControl>
                  <Input placeholder="Іван" {...field} />
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
                  <Input placeholder="Петров" {...field} />
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Зберегти зміни
          </Button>
        </div>
      </form>
    </Form>
  );
}
