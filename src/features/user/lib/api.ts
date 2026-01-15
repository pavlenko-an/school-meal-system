import { del, patch } from "@/shared/api/client";
import { updateUserFormInput, UserInfo } from "../model/user.types";

export async function updateUserApi(
  data: updateUserFormInput
): Promise<UserInfo> {
  const result = await patch<UserInfo, Partial<updateUserFormInput>>(
    "/api/users/me",
    data
  );
  if (result.error) throw new Error(result.error as string);
  return result.data!;
}

export async function deleteUserApi(): Promise<string> {
  const result = await del<string>("/api/users/me");
  if (result.error) throw new Error(result.error as string);
  return result.data!;
}
