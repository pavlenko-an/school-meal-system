import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth";
import ProfileForm from "@/features/user/ui/ProfileForm";
import ProfileInfo from "@/features/user/ui/ProfileInfo";
import { updateUserInput } from "@/features/user/model/user.types";
import { getUserById } from "@/features/user/lib/user";
import { getCurrentUser } from "@/shared/auth/current-user";
import DeleteAccountSection from "@/features/user/ui/DeleteAccountButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session?.user.id) {
    redirect("/auth/login?callbackUrl=/profile");
  }
  const currentUser = await getCurrentUser(session);
  const userInfo = await getUserById({ id: currentUser.id }, currentUser);
  const defaultValues: Partial<updateUserInput> = {
    email: userInfo.email,
    firstName: userInfo.firstName || "",
    lastName: userInfo.lastName || "",
  };

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
              Змініть ім&apos;я, прізвище. Email змінити можна тільки через
              підтримку.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm defaultValues={defaultValues} />
          </CardContent>
        </Card>

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
