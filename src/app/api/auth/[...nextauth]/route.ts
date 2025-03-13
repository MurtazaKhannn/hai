import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; // Import credentials provider
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// type User = {
//   id: number;
//   email: string;
//   username: string;
// };

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {

        if (!credentials) {
          return null; // or throw an error if you prefer
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return { id: user.id, email: user.email, username: user.username };
        }

        return null; // Return null if login failed
      },
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
    async session({ session, token }) {
      if (token) {
        session.user.id = Number(token.id);
        session.user.username = String(token.username);
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
