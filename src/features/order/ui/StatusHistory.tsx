import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrderHistory } from "../model/types";

interface Props {
  history: OrderHistory[];
  className?: string;
}

const statusLabels: Record<string, string> = {
  new: "Новий",
  published: "Опубліковано",
  accepted: "Прийнято",
  in_progress: "В обробці",
  completed: "Завершено",
  cancelled: "Скасовано",
};

const statusColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-800",
  published: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function StatusHistory({ history, className }: Props) {
  if (!history || history.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardHeader>
          <CardTitle>Історія змін статусу</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            Змін статусу ще не було
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Історія змін статусу</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((change) => {
            const actorName = change.actor
              ? [change.actor.firstName, change.actor.lastName]
                  .filter(Boolean)
                  .join(" ") || change.actor.email
              : "Система";

            return (
              <div
                key={change.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Змінено статус з
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs",
                        statusColors[change.previousStatus] || "bg-gray-100",
                      )}
                    >
                      {statusLabels[change.previousStatus] ||
                        change.previousStatus}
                    </Badge>
                    <span className="text-sm font-medium">на</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold",
                        statusColors[change.newStatus] || "bg-gray-100",
                      )}
                    >
                      {statusLabels[change.newStatus] || change.newStatus}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Виконавець: <span className="font-medium">{actorName}</span>
                  </p>
                </div>

                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(change.changedAt), "dd.MM.yyyy HH:mm", {
                    locale: uk,
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
