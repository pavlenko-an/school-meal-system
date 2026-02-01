"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CategoryInfo } from "@/features/category/model/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  currentParams: {
    categoryId?: string;
    name?: string;
    isAvailable?: string;
  };
  categories: CategoryInfo[];
}

export default function MenuItemsFilters({ currentParams, categories }: Props) {
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

  const isAvailableFilter = currentParams.isAvailable === "true";

  return (
    <div className="space-y-4 flex flex-wrap md:flex-nowrap md:items-center md:justify-center md:space-y-0 gap-2 md:gap-4">
      <Input
        placeholder="Пошук за назвою пункту меню..."
        value={nameSearch}
        onChange={(e) => {
          setNameSearch(e.target.value);
          updateFilter("name", e.target.value || undefined);
        }}
        className="max-w-sm"
      />
      <Select
        value={currentParams.categoryId || "all"}
        onValueChange={(value) =>
          updateFilter("categoryId", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Категорія" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">Всі</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Switch
          id="available-only"
          checked={isAvailableFilter}
          onCheckedChange={(checked) =>
            updateFilter("isAvailable", checked ? "true" : undefined)
          }
        />
        <Label htmlFor="available-only" className="cursor-pointer">
          Тільки доступні
        </Label>
      </div>
    </div>
  );
}
