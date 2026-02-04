"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationInfo } from "@/features/organization/model/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  currentParams: {
    name?: string;
    organizationId?: string;
  };
  organizations: OrganizationInfo[];
}

export default function UsersFilters({ currentParams, organizations }: Props) {
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
    <div className="space-y-4 flex flex-wrap md:flex-nowrap md:items-center md:justify-center md:space-y-0 gap-2 md:gap-4">
      <Input
        placeholder="Пошук за ім'ям користувача..."
        value={nameSearch}
        onChange={(e) => {
          setNameSearch(e.target.value);
          updateFilter("name", e.target.value || undefined);
        }}
        className="max-w-sm"
      />
      <Select
        value={currentParams.organizationId || "all"}
        onValueChange={(value) =>
          updateFilter("organizationId", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Організація" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">Всі</SelectItem>
          {organizations.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
