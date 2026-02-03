import { getCurrentUser } from "@/shared/auth/current-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getAllCategories } from "@/features/category/model/queries";
import MenuItemCreateForm from "@/features/menu-item/ui/MenuItemCreateForm";

export default async function NewMenuItemPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new UnauthorizedError("Unauthorized");
  }
  const data = await getAllCategories({
    limit: 100,
  });

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Новий пункт меню</CardTitle>
          <CardDescription>
            Створіть новий пункт меню для користувачів.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemCreateForm categories={data.categories} />
        </CardContent>
      </Card>
    </div>
  );
}
