import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container max-w-3xl py-12 md:py-20 mx-auto min-h-[70vh] flex items-center justify-center">
      <Card className="border-muted shadow-sm w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30">
            <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-500" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-bold">
            404 — Сторінку не знайдено
          </CardTitle>
          <CardDescription className="text-lg pt-3 text-muted-foreground">
            Схоже, ви перейшли за неіснуючим або видаленим посиланням.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-6 pt-2">
          <p className="text-muted-foreground max-w-md mx-auto">
            Можливо, посилання було змінено, сторінка переміщена або просто
            сталася помилка при наборі адреси.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild variant="default" className="min-w-45">
            <Link href="/supplier/dashboard">Повернутися до дашборду</Link>
          </Button>

          <Button variant="outline" asChild className="min-w-40">
            <Link href="/supplier/orders">До моїх замовлень</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
