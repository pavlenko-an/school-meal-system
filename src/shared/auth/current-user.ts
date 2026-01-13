import { Session } from "next-auth";

export type CurrentUser = {
  id: string;
  role: "employee" | "admin";
  organizationId: string | null;
  organizationType: "school" | "supplier" | null;
};

export async function getCurrentUser(session: Session): Promise<CurrentUser> {
  const { id, role, organizationId, organizationType } = session.user;

  return {
    id,
    role,
    organizationId: organizationId ?? null,
    organizationType: organizationType ?? null,
  };
}
