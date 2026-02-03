"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllOrganizations, getOrganizationById } from "../api/actions";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
}

interface Props {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function OrganizationSearchSelect({
  value,
  onChange,
  placeholder = "Оберіть організацію...",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState<string | undefined>();

  const [debouncedSearch] = useDebounce(search, 350);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults([]);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);

    (async () => {
      try {
        const data = await getAllOrganizations(null, {
          name: debouncedSearch,
          page: 1,
          limit: 20,
        });
        if (data?.success && data.data) {
          const organizations = data.data.organizations || [];
          if (isCurrent) setResults(organizations);
        }
      } catch {
        toast.error("Не вдалося завантажити організації. Спробуйте пізніше.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    })();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!value) {
      setSelectedName(undefined);
      return;
    }

    let isCurrent = true;
    (async () => {
      try {
        const res = await getOrganizationById(null, { id: value });
        if (res?.success && res.data) {
          const org = res.data;
          if (isCurrent) setSelectedName(org?.name);
          return;
        }
      } catch {
        // silent
      }
    })();

    return () => {
      isCurrent = false;
    };
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedName ?? placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Пошук за назвою..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Завантаження..." : "Організацій не знайдено"}
            </CommandEmpty>

            <CommandGroup>
              {results.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => {
                    onChange(org.id);
                    setSelectedName(org.name);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === org.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {org.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
