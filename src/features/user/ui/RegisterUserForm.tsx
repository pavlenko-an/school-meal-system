"use client";

import { useForm, useWatch } from "react-hook-form";
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
import { useActionState, useEffect, useState, useRef } from "react";
import { RegisterInput } from "@/features/auth";
import { registerUser } from "@/features/auth/api/actions";
import { OrganizationSearchSelect } from "@/features/organization/ui/OrganizationSearchSelect";
import { registerSchema } from "@/features/auth/model/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_SIZE = 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function RegisterUserForm() {
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      organizationId: "",
      confirmPassword: "",
      avatar: undefined,
    },
  });

  const avatarFile = useWatch({ control: form.control, name: "avatar" }) as
    | File
    | undefined;
  const firstName = useWatch({
    control: form.control,
    name: "firstName",
  }) as string | undefined;
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      toast.error("Файл занадто великий (макс. 1 МБ)");
      e.target.value = "";
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Тільки JPG, PNG, WebP");
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    form.setValue("avatar", file, { shouldValidate: true });
  };

  const handleRemove = () => {
    form.setValue("avatar", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const { setError } = form;

  const [state, formAction, isPending] = useActionState(registerUser, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Користувача успішно зареєстровано");
      router.push("/admin/users");
    } else if (state?.success === false && state.error) {
      toast.error(
        state.error ??
          "Не вдалося зареєструвати користувача. Спробуйте пізніше.",
      );
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof RegisterInput, {
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
          <FormItem>
            <FormLabel>Зображення (необов’язково)</FormLabel>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={preview ?? undefined}
                  alt={firstName || "Користувач"}
                />
                <AvatarFallback>{firstName?.[0] || "M"}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {avatarFile ? "Змінити фото" : "Обрати фото"}
                  </Button>

                  <Input
                    ref={fileInputRef}
                    name="avatar"
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {avatarFile && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Видалити зображення
                  </Button>
                )}
              </div>
            </div>
            <FormDescription>
              Рекомендований розмір: 200x200 пікселів. Макс. 5 МБ. Формати: JPG,
              PNG, WebP.
            </FormDescription>
            <FormMessage />
          </FormItem>
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
                <FormLabel>Ім&apos;я (необов’язково)</FormLabel>
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
                <FormLabel>Прізвище (необов’язково)</FormLabel>
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Підтвердження пароля</FormLabel>
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
