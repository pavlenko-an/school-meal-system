"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface MonthsSelectorProps {
  initialMonths: 1 | 3 | 6;
}

export default function MonthsSelector({ initialMonths }: MonthsSelectorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentMonths = parseInt(
    searchParams.get("months") || initialMonths.toString(),
    10
  ) as 1 | 3 | 6;

  const handleChange = (value: 1 | 3 | 6) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 1) {
      params.delete("months");
    } else {
      params.set("months", value.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 mb-4">
      {[1, 3, 6].map((m) => (
        <Button
          key={m}
          onClick={() => handleChange(m as 1 | 3 | 6)}
          variant={currentMonths === m ? "default" : "ghost"}
        >
          {m} міс.
        </Button>
      ))}
    </div>
  );
}
