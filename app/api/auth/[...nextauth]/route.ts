// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { getUserByEmail } from "@/lib/user";

const handler = NextAuth({
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

        // Ensure user.password is a string
        if (!user.password) {
          throw new Error("No password set for this user.");
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        console.log("Credentials authorize successful:", user.email);
        return { id: user.id.toString(), email: user.email };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add more providers if needed
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth", // Redirect to your custom auth page
    // You can also define signOut, error, verifyRequest, newUser pages if needed
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("signIn callback:", { user, account, profile, email, credentials });
      
      // Additional logic can be added here if needed
      
      return true; // Allow sign in
    },
    async redirect({ url, baseUrl }) {
      console.log("redirect callback:", { url, baseUrl });

      // If the URL is relative, prepend the base URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow relative callback URLs
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("jwt callback:", { token, user, account, profile, isNewUser });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("session callback:", { session, token, user });
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // <-- Ensure this line exists
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
