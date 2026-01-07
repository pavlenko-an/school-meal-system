export type CurrentUser = {
  id: string;
  role: "employee" | "admin";
  organizationId?: string;
};
