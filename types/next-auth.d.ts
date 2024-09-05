// types/next-auth.d.ts

import NextAuth from "next-auth";
import { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: number; // Ensure `id` is a number
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
    };
  }

  interface User extends PrismaUser {
    username: string;
  }
}