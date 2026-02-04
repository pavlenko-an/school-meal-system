import { getServerSession } from "next-auth";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { authOptions } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  organizationId?: string;
  organizationType?: "school" | "supplier";
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
    name: session.user.name ?? undefined,
    image: session.user.image ?? undefined,
    organizationId: session.user.organizationId ?? undefined,
    organizationType: session.user.organizationType ?? undefined,
    role: session.user.role,
  };
}
