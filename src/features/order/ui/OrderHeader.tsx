import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Controller, UseFormReturn } from "react-hook-form";
import { createOrderInput } from "../model/order.types";

export default function OrderHeader({ form }: { form: UseFormReturn<createOrderInput> }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Дата поставки</Label>
        <Controller
          name="deliveryDate"
          control={form.control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                  aria-label="Оберіть дату поставки"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value instanceof Date && !isNaN(field.value.getTime())
                    ? format(field.value, "d MMMM yyyy", { locale: uk })
                    : "Оберіть дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value ?? undefined}
                  onSelect={(date) => {
                    field.onChange(date);
                  }}
                  disabled={(date) => date < new Date()}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Коментар до замовлення</Label>
        <Textarea
          placeholder="Додаткові побажання, особливості доставки тощо..."
          {...form.register("comment")}
          rows={4}
        />
      </div>
    </div>
  );
}
