import { Session, User, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";
import { loginSchema } from "@/features/auth/model/login.schema";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const data = loginSchema.parse(credentials);

        const user = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(data.password, user.passwordHash);

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
