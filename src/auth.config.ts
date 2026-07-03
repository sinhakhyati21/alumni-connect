import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // providers added only in auth.ts (Node runtime)
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.profileComplete = user.profileComplete;
      }
      if (trigger === "update" && session) {
        token.role = session.role ?? token.role;
        token.profileComplete = session.profileComplete ?? token.profileComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "student" | "alumni" | "admin";
        session.user.profileComplete = token.profileComplete as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;