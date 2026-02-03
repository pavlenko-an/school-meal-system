"use client";

import { useForm } from "react-hook-form";
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
import { createOrganizationInput } from "../model/types";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createOrganizationSchema } from "../model/schemas";
import { createOrganization } from "../api/actions";
import { School, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function OrganizationCreateForm() {
  const router = useRouter();

  const form = useForm<createOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      type: undefined,
      contactEmail: "",
      contactPhone: "",
    },
  });

  const { setError } = form;

  const [state, formAction, isPending] = useActionState(
    createOrganization,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success && state.data) {
      toast.success("Організація успішно створена");
      router.push("/admin/organizations");
    } else if (state?.success === false && state.error) {
      toast.error(
        state.error ?? "Не вдалося створити організацію. Спробуйте пізніше.",
      );
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof createOrganizationInput, {
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
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Тип організації</FormLabel>
                <FormDescription>
                  Тип не можна змінити після створення організації.
                </FormDescription>
                <input
                  type="hidden"
                  name={field.name}
                  value={field.value ?? ""}
                />
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem
                          value="school"
                          id="school"
                          className="sr-only"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="school"
                        className={cn(
                          "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                          field.value === "school" &&
                            "border-primary bg-primary/5 text-primary ring-2 ring-primary/20",
                        )}
                      >
                        <School className="mb-2 h-6 w-6" />
                        <span className="text-sm font-medium">Школа</span>
                      </FormLabel>
                    </FormItem>

                    <FormItem>
                      <FormControl>
                        <RadioGroupItem
                          value="supplier"
                          id="supplier"
                          className="sr-only"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="supplier"
                        className={cn(
                          "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                          field.value === "supplier" &&
                            "border-primary bg-primary/5 text-primary ring-2 ring-primary/20",
                        )}
                      >
                        <Truck className="mb-2 h-6 w-6" />
                        <span className="text-sm font-medium">
                          Постачальник
                        </span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
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
            aria-label="Зберегти нову організацію"
          >
            Зберегти зміни
          </Button>
        </div>
      </form>
    </Form>
  );
}
