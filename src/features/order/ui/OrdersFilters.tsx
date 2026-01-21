"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    status?: string;
    payment?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default function OrdersFilters({ currentParams }: Props) {
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
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0 md:gap-6">
      <div className="flex-1">
        <Tabs
          value={currentParams.status || "all"}
          onValueChange={(value) =>
            updateFilter("status", value === "all" ? undefined : value)
          }
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Всі</TabsTrigger>
            <TabsTrigger value="new">Нові</TabsTrigger>
            <TabsTrigger value="published">Опубліковані</TabsTrigger>
            <TabsTrigger value="accepted">Прийняті</TabsTrigger>
            <TabsTrigger value="in_progress">В роботі</TabsTrigger>
            <TabsTrigger value="completed">Завершені</TabsTrigger>
            <TabsTrigger value="cancelled">Скасовані</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Select
        value={currentParams.payment || "all"}
        onValueChange={(value) =>
          updateFilter("payment", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Статус оплати" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі оплати</SelectItem>
          <SelectItem value="unpaid">Неоплачені</SelectItem>
          <SelectItem value="paid">Оплачені</SelectItem>
          <SelectItem value="verified">Підтверджені</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-60 justify-start text-left font-normal",
                !currentParams.dateFrom && "text-muted-foreground",
              )}
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
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-60 justify-start text-left font-normal",
                !currentParams.dateTo && "text-muted-foreground",
              )}
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
                currentParams.dateTo
                  ? new Date(currentParams.dateTo)
                  : undefined
              }
              onSelect={(date) =>
                updateFilter(
                  "dateTo",
                  date ? format(date, "yyyy-MM-dd") : undefined,
                )
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
