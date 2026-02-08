"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  currentParams: {
    name?: string;
    type?: "school" | "supplier";
  };
}

export default function OrganizationsFilters({ currentParams }: Props) {
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

  const orgOptions = [
    { value: "all", label: "Всі" },
    { value: "school", label: "Школа" },
    { value: "supplier", label: "Постачальник" },
  ];

  return (
    <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap md:items-center md:justify-center md:space-y-0 gap-4">
      <Input
        placeholder="Пошук за назвою організації..."
        value={nameSearch}
        onChange={(e) => {
          setNameSearch(e.target.value);
          updateFilter("name", e.target.value || undefined);
        }}
        className="max-w-sm"
      />
      <Select
        value={currentParams.type || "all"}
        onValueChange={(value) =>
          updateFilter("type", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-full md:w-45">
          <SelectValue placeholder="Тип організації" />
        </SelectTrigger>
        <SelectContent position="popper">
          {orgOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
