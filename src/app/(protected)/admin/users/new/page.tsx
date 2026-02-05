import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RegisterUserForm from "@/features/user/ui/RegisterUserForm";

export default async function RegisterUserPage() {
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Реєстрація користувача</CardTitle>
          <CardDescription>
            Створіть нового користувача для системи.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterUserForm />
        </CardContent>
      </Card>
    </div>
  );
}
