import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllOrderItems } from "../model/queries";
import { OrderItemInfo } from "../model/types";

interface Props {
  orderId: string;
}

export async function OrderItemsMiniTable({ orderId }: Props) {
  const items: OrderItemInfo[] = await getAllOrderItems({ orderId, limit: 5 });
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        У замовленні немає позицій
      </div>
    );
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Страва</TableHead>
            <TableHead className="text-right">Ціна</TableHead>
            <TableHead className="text-right">К-сть</TableHead>
            <TableHead className="text-right">Сума</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.menuItem?.name || "—"}
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
            <TableCell colSpan={3} className="text-right font-semibold">
              Разом
            </TableCell>
            <TableCell className="text-right text-base font-bold">
              {total.toLocaleString("uk-UA", {
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
