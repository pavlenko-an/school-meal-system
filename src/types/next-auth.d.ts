import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string | null;
      role: "employee" | "admin";
    };
  }
  interface User {
    id: string;
    role?: "employee" | "admin";
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?: "employee" | "admin";
  }
}
