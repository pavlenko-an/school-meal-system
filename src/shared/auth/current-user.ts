export type CurrentUser = {
  id: string;
  role: "employee" | "admin";
  organizationId: string | null;
  organizationType: "school" | "supplier" | null;
};
