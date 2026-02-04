import { getCurrentUser } from "@/shared/auth/current-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getMenuItemById } from "@/features/menu-item/model/queries";
import { updateMenuItemInput } from "@/features/menu-item/model/types";
import { getAllCategories } from "@/features/category/model/queries";
import MenuItemEditForm from "@/features/menu-item/ui/MenuItemEditForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditMenuItemPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new UnauthorizedError("Unauthorized");
  }
  const menuItem = await getMenuItemById({ id });
  const defaultValues = {
    id: menuItem?.id,
    name: menuItem?.name,
    description: menuItem?.description || "",
    price: menuItem?.price || 0,
    isAvailable: menuItem?.isAvailable,
    categoryId: menuItem?.category?.id || "",
    imageUrl: menuItem?.imageUrl || null,
  };
  const data = await getAllCategories({
    limit: 100,
  });

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Редагувати пункт меню</CardTitle>
          <CardDescription>Оновіть інформацію про пункт меню.</CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemEditForm
            defaultValues={defaultValues}
            categories={data.categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
