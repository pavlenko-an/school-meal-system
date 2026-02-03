import { Session, User, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/shared/db/prisma";
import { JWT } from "next-auth/jwt";
import { loginSchema } from "../model/schemas";

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
          include: { organization: true },
        });

        if (!user) return null;
        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.firstName + " " + user.lastName,
          image: user.avatarUrl || null,
          organizationId: user.organizationId,
          organizationType: user.organization?.type ?? null,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organizationType = user.organizationType;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (token.role) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.organizationType = token.organizationType;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
