import ProfileForm from "@/features/user/ui/ProfileForm";
import ProfileInfo from "@/features/user/ui/ProfileInfo";
import { getCurrentUser } from "@/shared/auth/current-user";
import DeleteAccountSection from "@/features/user/ui/DeleteAccountButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OrganizationForm from "@/features/organization/ui/OrganizationForm";
import { getUserById } from "@/features/user/model/queries";
import { updateOrganizationInput } from "@/features/organization/model/types";

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  const userInfo = await getUserById({ id: currentUser.id }, currentUser);
  const defaultUserValues = {
    email: userInfo.email,
    firstName: userInfo.firstName || "",
    lastName: userInfo.lastName || "",
    avatarUrl: userInfo.avatarUrl || "",
  };
  const defaultOrgValues: Partial<updateOrganizationInput> =
    userInfo.organization
      ? {
          id: userInfo.organization.id,
          name: userInfo.organization.name || "",
          contactEmail: userInfo.organization.contactEmail || "",
          contactPhone: userInfo.organization.contactPhone || "",
        }
      : {};

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Особистий кабінет</h1>
        <p className="text-muted-foreground mt-2">
          Управління вашим обліковим записом та особистими даними
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Особиста інформація</CardTitle>
            <CardDescription>
              Ці дані відображаються в системі та використовуються для
              ідентифікації
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileInfo user={userInfo} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Редагувати дані</CardTitle>
            <CardDescription>
              Змініть ім&apos;я, прізвище, Email або пароль.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm defaultValues={defaultUserValues} />
          </CardContent>
        </Card>
        {userInfo.organization && (
          <Card>
            <CardHeader>
              <CardTitle>Дані організації</CardTitle>
              <CardDescription>
                Змініть назву організації та контактні дані
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationForm defaultValues={defaultOrgValues} />
            </CardContent>
          </Card>
        )}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Небезпечна зона</CardTitle>
            <CardDescription>Дії, які неможливо скасувати</CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
