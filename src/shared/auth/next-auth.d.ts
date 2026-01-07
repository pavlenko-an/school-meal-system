import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string | null;
      organizationId: string;
      role: "employee" | "admin";
    };
  }
  interface User {
    id: string;
    organizationId: string;
    role: "employee" | "admin";
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "employee" | "admin";
    organizationId: string;
  }
}
