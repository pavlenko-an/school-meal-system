import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OrganizationCreateForm from "@/features/organization/ui/OrganizationCreateForm";

export default async function NewOrganizationPage() {
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Нова організація</CardTitle>
          <CardDescription>
            Створіть нову організацію для користувачів.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
