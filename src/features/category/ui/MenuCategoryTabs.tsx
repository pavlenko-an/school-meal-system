"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { CategoryInfo } from "../model/category.types";

export default function MenuCategoryTabs({
  categories,
}: {
  categories: CategoryInfo[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentCategory = searchParams.get("categoryId") || "all";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("categoryId");
    } else {
      params.set("categoryId", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs
      defaultValue="all"
      value={currentCategory}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="all">Всі страви</TabsTrigger>
        {categories.map((cat) => (
          <TabsTrigger key={cat.id} value={cat.id}>
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
