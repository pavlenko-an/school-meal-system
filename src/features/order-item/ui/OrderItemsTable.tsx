import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderItemInfo } from "../model/order-item.types";

interface Props {
  items: OrderItemInfo[];
}

export function OrderItemsTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        У замовленні немає позицій
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Страва</TableHead>
            <TableHead className="text-right">Ціна за одиницю</TableHead>
            <TableHead className="text-right">Кількість</TableHead>
            <TableHead className="text-right">Сума</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.menuItem?.name}
              </TableCell>
              <TableCell className="text-right">
                {item.price.toLocaleString("uk-UA", {
                  style: "currency",
                  currency: "UAH",
                })}
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right font-medium">
                {(item.price * item.quantity).toLocaleString("uk-UA", {
                  style: "currency",
                  currency: "UAH",
                })}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} className="text-left font-semibold">
              Загальна сума
            </TableCell>
            <TableCell className="text-right text-lg font-bold">
              {items
                .reduce((sum, i) => sum + i.price * i.quantity, 0)
                .toLocaleString("uk-UA", {
                  style: "currency",
                  currency: "UAH",
                })}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
