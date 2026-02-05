"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error() {
  return (
    <div className="max-w-4xl py-12 md:py-20 mx-auto">
      <Card className="border-destructive/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl md:text-3xl">
            Щось пішло не так...
          </CardTitle>
          <CardDescription className="text-base pt-2">
            Не вдалося завантажити цю сторінку.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4 pt-2 pb-6">
          <p className="text-muted-foreground">
            Спробуйте оновити сторінку або повернутися пізніше.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Оновити сторінку
          </Button>

          <Button variant="default" asChild>
            <a href="/profile">Повернутися до профілю</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
