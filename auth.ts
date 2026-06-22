import { randomUUID } from "node:crypto";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { getNextUserRole, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const googleAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: parsed.data.email,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    ...(googleAuthEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const existingUser = await db.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });

      if (!existingUser) {
        await db.user.create({
          data: {
            email: user.email,
            name: user.name?.trim() || user.email.split("@")[0],
            passwordHash: await hashPassword(randomUUID()),
            role: await getNextUserRole(),
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const databaseUser = user.email
          ? await db.user.findUnique({
              where: { email: user.email },
              select: { id: true, role: true },
            })
          : null;

        token.role = databaseUser?.role ?? user.role ?? "USER";
        token.sub = databaseUser?.id ?? user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
