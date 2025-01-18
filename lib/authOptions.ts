// lib/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { getUserByEmail } from "@/lib/user";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email", 
          placeholder: "your-email@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        },
      },
      async authorize(credentials) {
        try {
          console.log("Credentials authorize called");
          if (!credentials) {
            throw new Error("No credentials provided");
          }

          const { email, password } = credentials;

          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          const user = await getUserByEmail(email);
          if (!user) {
            throw new Error("No user found with the given email");
          }

          if (!user.emailVerified) {
            throw new Error("Please verify your email before signing in");
          }

          if (!user.password) {
            throw new Error("No password set for this user.");
          }

          const isValid = await verifyPassword(password, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          console.log("Credentials authorize successful:", user.email);
          
          // Return the user object with all required fields
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            role: user.role || 'USER', // Ensure role is included
            image: null // Add if you have this field
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("signIn callback:", { user, account, profile, email, credentials });
      if (account?.provider !== "credentials") {
        return true;
      }
      if (user.emailVerified) {
        return true;
      }
      return "/auth/verify-request";
    },
    async redirect({ url, baseUrl }) {
      console.log("redirect callback:", { url, baseUrl });
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      console.log("jwt callback:", { token, user });
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
        token.role = user.role; // Include role in the token
      } else if(token.email && !token.role) {
        try {
          const existingUser = await getUserByEmail(token.email);
          if (existingUser) {
            token.role = existingUser.role;
          }
        } catch (error) {
          console.error("Error fetching user in jwt callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log("session callback:", { session, token });
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.role = token.role as 'USER' | 'TEST_USER' | 'ADMIN'; 
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}