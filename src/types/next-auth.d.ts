import { DefaultSession } from "next-auth";

type Role = "ADMIN" | "EDITOR" | "VIEWER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      email: string;
      name?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    userId?: string;
  }
}