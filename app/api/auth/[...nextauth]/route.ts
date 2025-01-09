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

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in");
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
        return { 
          id: user.id.toString(), 
          email: user.email,
          emailVerified: user.emailVerified,
          name: user.name
        };
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
    verifyRequest: '/auth/verify-request', // Add this line
    error: '/auth/error', // Add this line
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("signIn callback:", { user, account, profile, email, credentials });
      
      // If using OAuth provider, consider the email as verified
      if (account?.provider !== "credentials") {
        return true;
      }
      
      // For credentials provider, check if email is verified
      if (user.emailVerified) {
        return true;
      }

      // Redirect to verify request page if email not verified
      return '/auth/verify-request';
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
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("session callback:", { session, token, user });
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };