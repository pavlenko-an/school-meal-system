"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  currentParams: {
    name?: string;
  };
}

export default function CategoriesFilters({ currentParams }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nameSearch, setNameSearch] = useState(currentParams.name || "");

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
    <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap md:items-center md:justify-center md:space-y-0 gap-4">
      <Input
        placeholder="Пошук за назвою категорії..."
        value={nameSearch}
        onChange={(e) => {
          setNameSearch(e.target.value);
          updateFilter("name", e.target.value || undefined);
        }}
        className="max-w-sm"
      />
    </div>
  );
}
