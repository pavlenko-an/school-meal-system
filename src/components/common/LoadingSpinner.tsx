import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
  text = "Завантаження...",
}: Props) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-muted-foreground",
        className,
      )}
    >
      <Loader2 className={cn("animate-spin", sizes[size])} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
