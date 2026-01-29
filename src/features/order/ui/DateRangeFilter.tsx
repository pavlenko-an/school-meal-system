"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  currentParams: {
    dateFrom?: string;
    dateTo?: string;
  };
}

export default function DateRangeFilters({ currentParams }: Props) {
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

  return (
    <div className="space-y-4 flex flex-wrap gap-2 mb-2 md:flex-nowrap md:items-center md:justify-center md:space-y-0  md:gap-4">
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
