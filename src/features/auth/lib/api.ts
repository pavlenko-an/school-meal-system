import { signIn } from "next-auth/react";
import { Session } from "next-auth";
import { LoginFormInput } from "../model/types";

export async function loginApi(data: LoginFormInput): Promise<void> {
  const result = await signIn("credentials", {
    redirect: false,
    email: data.email,
    password: data.password,
  });
  if (result?.error) {
    if (result.error === "CredentialsSignin") {
      throw new Error("Невірний email або пароль");
    } else {
      throw new Error("Помилка входу. Спробуйте пізніше.");
    }
  }

  const sessionRes = await fetch("/api/auth/session");
  const sessionData: { user: Session["user"] } = await sessionRes.json();

  let redirectTo = "/dashboard";
  const { role, organizationType } = sessionData.user;
  if (role === "admin") redirectTo = "/admin/dashboard";
  else if (role === "employee" && organizationType === "school")
    redirectTo = "/school/dashboard";
  else if (role === "employee" && organizationType === "supplier")
    redirectTo = "/supplier/dashboard";

  window.location.href = redirectTo;
}
