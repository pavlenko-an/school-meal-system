"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentParams?: Record<string, string | string[] | undefined>;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  currentParams,
  itemsPerPage = 10,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (currentParams) {
      Object.entries(currentParams).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.set(key, value);
          }
        }
      });
    }

    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
      <p className="text-sm text-muted-foreground text-center sm:text-left">
        Показується {from}–{to} з {totalItems}
      </p>

      <div className="flex justify-center sm:justify-end gap-2">
        <Button variant="outline" size="sm" disabled={prevDisabled} asChild>
          <a
            href={
              prevDisabled
                ? undefined
                : createPageUrl(Math.max(1, currentPage - 1))
            }
            onClick={prevDisabled ? (e) => e.preventDefault() : undefined}
            aria-disabled={prevDisabled}
            tabIndex={prevDisabled ? -1 : 0}
          >
            Попередня
          </a>
        </Button>

        <Button variant="outline" size="sm" disabled={nextDisabled} asChild>
          <a
            href={
              nextDisabled
                ? undefined
                : createPageUrl(Math.min(totalPages, currentPage + 1))
            }
            onClick={nextDisabled ? (e) => e.preventDefault() : undefined}
            aria-disabled={nextDisabled}
            tabIndex={nextDisabled ? -1 : 0}
          >
            Наступна
          </a>
        </Button>
      </div>
    </div>
  );
}
