import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CategoryCreateForm from "@/features/category/ui/CategoryCreateForm";

export default async function NewCategoryPage() {
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
