import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OrderInfo } from "../model/types";
import { format, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { uk } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";
import { OrderItemsMiniTable } from "@/features/order-item/ui/OrderItemsMiniTable";

interface Props {
  orders: OrderInfo[];
  organizationType?: "school" | "supplier";
}

export default function OrderRows({ orders, organizationType }: Props) {
  const today = startOfDay(new Date());

  return (
    <>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg bg-muted/30">
          Опублікованих замовлень не знайдено
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {orders.map((order) => {
            const isPast =
              order.deliveryDate && isBefore(order.deliveryDate, today);

            return (
              <AccordionItem
                key={order.id}
                value={order.id}
                className="border rounded-lg overflow-hidden data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="flex items-center hover:no-underline px-5 py-4 bg-muted/20 hover:bg-muted/40 transition-colors border-b border-gray-200 data-[state=open]:border-b-0">
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                    <div>
                      <div className="font-medium">
                        Замовлення #{order.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {order.school?.name || "—"}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-medium">
                          {order.totalPrice.toLocaleString("uk-UA", {
                            style: "currency",
                            currency: "UAH",
                          })}
                        </div>
                        {order.deliveryDate && (
                          <div
                            className={cn(
                              "text-sm",
                              isPast
                                ? "text-muted-foreground line-through"
                                : "",
                            )}
                          >
                            {format(order.deliveryDate, "dd.MM.yyyy", {
                              locale: uk,
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-5 pb-5 pt-2 bg-background border-t border-b border-gray-400 data-[state=open]:border-b-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Створено</dt>
                        <dd className="font-medium mt-0.5">
                          {format(
                            new Date(order.createdAt),
                            "dd.MM.yyyy HH:mm",
                            { locale: uk },
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Коментар</dt>
                        <dd className="mt-0.5">{order.comment || "—"}</dd>
                      </div>
                      <div className="sm:text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/${organizationType}/orders/${order.id}`}
                          >
                            Повна інформація <Eye className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold mb-3">
                        Позиції замовлення
                      </h3>
                      <OrderItemsMiniTable orderId={order.id} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </>
  );
}
