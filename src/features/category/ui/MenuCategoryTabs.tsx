"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { CategoryInfo } from "../model/types";

interface Props {
  categories: CategoryInfo[];
}

export default function MenuCategoryTabs({ categories }: Props) {
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
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <Tabs
        defaultValue="all"
        value={currentCategory}
        onValueChange={handleTabChange}
      >
        <TabsList className="inline-flex w-max md:w-full">
          <TabsTrigger value="all" className="whitespace-nowrap">
            Всі страви
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="whitespace-nowrap"
            >
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
