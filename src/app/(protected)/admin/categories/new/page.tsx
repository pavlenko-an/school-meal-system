import { getCurrentUser } from "@/shared/auth/current-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import CategoryCreateForm from "@/features/category/ui/CategoryCreateForm";

export default async function NewCategoryPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new UnauthorizedError("Unauthorized");
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Нова категорія</CardTitle>
          <CardDescription>
            Створіть нову категорію для пунктів меню.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
