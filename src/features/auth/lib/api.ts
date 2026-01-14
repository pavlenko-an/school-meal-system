import { post } from "@/shared/api/client";
import { LoginFormInput, RegisterInput } from "../model/auth.types";
import { signIn } from "next-auth/react";

export async function registerApi(data: RegisterInput): Promise<string> {
  const result = await post<string, RegisterInput>("/api/auth/register", data);
  if (result.error) throw new Error(result.error as string);
  return result.data!;
}

export async function loginApi(
  data: LoginFormInput,
  callbackUrl = "/"
): Promise<void> {
  const result = await signIn("credentials", {
    redirect: false,
    email: data.email,
    password: data.password,
    callbackUrl,
  });
  if (result?.error) {
    if (result.error === "CredentialsSignin") {
      throw new Error("Невірний email або пароль");
    } else {
      throw new Error("Помилка входу. Спробуйте пізніше.");
    }
  }
  if (result?.url) {
    window.location.href = result.url;
  }
}
