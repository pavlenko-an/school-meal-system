import { authOptions } from "@/features/auth";
import { getServerSession } from "next-auth";
import { UnauthorizedError } from "../errors/unauthorized-error";

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  organizationId: string | null;
  organizationType: "school" | "supplier" | null;
  role: "employee" | "admin";
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session?.user.id) {
    throw new UnauthorizedError("Unauthorized");
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    organizationId: session.user.organizationId ?? null,
    organizationType: session.user.organizationType ?? null,
    role: session.user.role,
  };
}
