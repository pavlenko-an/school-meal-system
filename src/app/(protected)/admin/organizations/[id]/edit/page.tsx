import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateOrganizationInput } from "@/features/organization/model/types";
import { getOrganizationById } from "@/features/organization/model/queries";
import OrganizationEditForm from "@/features/organization/ui/OrganizationEditForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOrganizationPage({ params }: Props) {
  const { id } = await params;
  const organization = await getOrganizationById({ id });
  const defaultValues: Partial<updateOrganizationInput> = {
    id: organization?.id,
    name: organization?.name,
    contactEmail: organization?.contactEmail || "",
    contactPhone: organization?.contactPhone || "",
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Редагувати організацію</CardTitle>
          <CardDescription>Оновіть інформацію про організацію.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationEditForm defaultValues={defaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}
