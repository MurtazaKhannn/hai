import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user) {
        // Check if the user already exists in the database
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // Hash a default or generated password for the new user
          const hashedPassword = await bcrypt.hash("default_password", 10);

          // Create a new user with the hashed password
          existingUser = await prisma.user.create({
            data: {
              email: user.email!,
              username: user.name!,
              password: hashedPassword, // Store the hashed password
            },
          });
        }

        // Optionally, you can store additional data if needed
        // Return true to indicate successful sign-in
        return true;
      }
      return false;
    },
    async session({ session, user }) {
      if (user) {
        session.user.id = Number(user.id) // Add user ID to the session
        session.user.username = user.username; // Add username to the session
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Add user ID to the JWT token
        token.username = user.username; // Add username to the JWT token
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
