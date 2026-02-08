"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { updateUserInput } from "../model/types";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { updateUserSchema } from "../model/schemas";
import { updateUser } from "../api/actions";
import { Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_SIZE = 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type Props = {
  defaultValues: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
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
      avatar: undefined,
      password: "",
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
      toast.error("Тільки JPG, PNG, WebP, AVIF");
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

  const [state, formAction, isPending] = useActionState(updateUser, null);

  useEffect(() => {
    if (!state) return;
    if (state.success && state.data) {
      toast.success("Профіль успішно оновлено");
      router.refresh();
    } else if (state?.success === false && state.error) {
      toast.error(
        state.error ?? "Не вдалося оновити профіль. Спробуйте пізніше.",
      );
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as keyof updateUserInput, {
            type: "server",
            message: messages?.join(", ") || "Помилка",
          });
        });
      }
    }
  }, [state, router, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <div className="flex flex-col gap-6">
          <FormItem>
            <FormLabel>Зображення</FormLabel>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={preview ?? defaultValues.avatarUrl ?? undefined}
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
              Рекомендований розмір: 200x200 пікселів. Макс. 1 МБ. Формати: JPG,
              PNG, WebP, AVIF.
            </FormDescription>
            <FormMessage />
          </FormItem>
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
