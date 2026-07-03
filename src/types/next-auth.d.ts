import { DefaultSession } from "next-auth";

type UserRole = "student" | "alumni" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      profileComplete: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    profileComplete: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    profileComplete: boolean;
  }
}