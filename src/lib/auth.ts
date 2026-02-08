import { Session, User, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/shared/db/prisma";
import { JWT } from "next-auth/jwt";
import { loginSchema } from "@/features/auth/model/schemas";
import { SessionUpdateData } from "@/shared/auth/update-session";

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
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User;
      trigger?: "signIn" | "signUp" | "update";
      session?: SessionUpdateData;
    }) {
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.name = user.name ?? null;
        token.image = user.image ?? null;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organizationType = user.organizationType;
      }

      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.email !== undefined) token.email = session.email;
        if (session.image !== undefined) token.image = session.image;
        if (session.role !== undefined) token.role = session.role;
        if (session.organizationId !== undefined)
          token.organizationId = session.organizationId;
        if (session.organizationType !== undefined)
          token.organizationType = session.organizationType;
      }

      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name ?? null;
        session.user.image = token.image ?? null;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId ?? null;
        session.user.organizationType = token.organizationType ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
