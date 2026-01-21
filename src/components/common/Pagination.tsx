"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useSearchParams } from "next/navigation";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentParams: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  currentParams,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-sm text-muted-foreground">
        Показується {(currentPage - 1) * 10 + 1}–
        {Math.min(currentPage * 10, totalItems)} з {totalItems}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          asChild
        >
          <a href={createPageUrl(currentPage - 1)}>Попередня</a>
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          asChild
        >
          <a href={createPageUrl(currentPage + 1)}>Наступна</a>
        </Button>
      </div>
    </div>
  );
}
