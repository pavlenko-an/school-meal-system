"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  currentParams: {
    orderStatus?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  allowedOrderStatuses?: { value: string; label: string }[];
}

export default function OrdersFilters({ currentParams, allowedOrderStatuses }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const orderOptions =
    allowedOrderStatuses ?? [
      { value: "all", label: "Всі" },
      { value: "draft", label: "Чернетки" },
      { value: "published", label: "Опубліковані" },
      { value: "accepted", label: "Прийняті" },
      { value: "in_progress", label: "В обробці" },
      { value: "completed", label: "Завершені" },
      { value: "cancelled", label: "Скасовані" },
    ];

  return (
    <div className="space-y-4 flex flex-wrap md:flex-nowrap md:items-center md:justify-center md:space-y-0 gap-2 md:gap-4">
      <Select
        value={currentParams.orderStatus || "all"}
        onValueChange={(value) =>
          updateFilter("orderStatus", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Статус замовлення" />
        </SelectTrigger>
        <SelectContent position="popper">
          {orderOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentParams.paymentStatus || "all"}
        onValueChange={(value) =>
          updateFilter("paymentStatus", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Статус оплати" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">Всі оплати</SelectItem>
          <SelectItem value="unpaid">Неоплачені</SelectItem>
          <SelectItem value="paid">Оплачені</SelectItem>
          <SelectItem value="verified">Підтверджені</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-45 justify-start text-left font-normal",
              !currentParams.dateFrom && "text-muted-foreground",
            )}
            aria-label="Оберіть дату від"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentParams.dateFrom
              ? format(new Date(currentParams.dateFrom), "PPP", {
                  locale: uk,
                })
              : "Дата від"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              currentParams.dateFrom
                ? new Date(currentParams.dateFrom)
                : undefined
            }
            onSelect={(date) =>
              updateFilter(
                "dateFrom",
                date ? format(date, "yyyy-MM-dd") : undefined,
              )
            }
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-45 justify-start text-left font-normal",
              !currentParams.dateTo && "text-muted-foreground",
            )}
            aria-label="Оберіть дату до"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentParams.dateTo
              ? format(new Date(currentParams.dateTo), "PPP", { locale: uk })
              : "Дата до"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              currentParams.dateTo ? new Date(currentParams.dateTo) : undefined
            }
            onSelect={(date) =>
              updateFilter(
                "dateTo",
                date ? format(date, "yyyy-MM-dd") : undefined,
              )
            }
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
