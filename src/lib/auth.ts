import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        const ip =
          req?.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
          req?.headers?.["x-real-ip"]?.toString() ??
          null;
        const ua = req?.headers?.["user-agent"]?.toString() ?? null;

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            entityType: "Auth",
            entityId: user.id,
            message: "Admin login successful.",
            ipAddress: ip,
            userAgent: ua,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "Admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
};

