import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      organizationId: string | null;
      organizationType: "school" | "supplier" | null;
      role: "employee" | "admin";
    };
  }
  interface User {
    id: string;
    organizationId: string | null;
    organizationType: "school" | "supplier" | null;
    role: "employee" | "admin";
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "employee" | "admin";
    organizationId: string | null;
    organizationType: "school" | "supplier" | null;
  }
}
