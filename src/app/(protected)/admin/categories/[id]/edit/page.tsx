import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCategoryById } from "@/features/category/model/queries";
import { updateCategoryInput } from "@/features/category/model/types";
import CategoryEditForm from "@/features/category/ui/CategoryEditForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await getCategoryById({ id });
  const defaultValues: Partial<updateCategoryInput> = {
    id: category.id,
    name: category.name,
    description: category.description || "",
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Редагувати категорію</CardTitle>
          <CardDescription>
            Оновіть інформацію про категорію пунктів меню.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryEditForm defaultValues={defaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}
