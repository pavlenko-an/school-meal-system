import { getCurrentUser } from "@/shared/auth/current-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserById } from "@/features/user/model/queries";
import EditUserForm from "@/features/user/ui/EditUserForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const user = await getUserById({ id }, currentUser);
  const defaultValues = {
    id: user?.id,
    email: user?.email,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    avatarUrl: user?.avatarUrl || null,
    organizationId: user?.organization?.id || "",
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Редагувати користувача</CardTitle>
          <CardDescription>Оновіть інформацію про користувача.</CardDescription>
        </CardHeader>
        <CardContent>
          <EditUserForm defaultValues={defaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}
