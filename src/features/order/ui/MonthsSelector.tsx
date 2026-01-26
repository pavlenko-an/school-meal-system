"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface Props {
  initialMonths: 1 | 3 | 6;
}

export default function MonthsSelector({ initialMonths }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const monthsValue = parseInt(searchParams.get("months") ?? "", 10);
  const currentMonths: 1 | 3 | 6 = [1, 3, 6].includes(monthsValue)
    ? (monthsValue as 1 | 3 | 6)
    : initialMonths;
  const monthsOptions: (1 | 3 | 6)[] = [1, 3, 6];

  const handleChange = (value: 1 | 3 | 6) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 1) {
      params.delete("months");
    } else {
      params.set("months", value.toString());
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-4 mb-4">
      {monthsOptions.map((m) => (
        <Button
          key={m}
          onClick={() => handleChange(m)}
          variant={currentMonths === m ? "default" : "ghost"}
          aria-label={`Показати замовлення за останні ${m} місяців`}
        >
          {m} міс.
        </Button>
      ))}
    </div>
  );
}
