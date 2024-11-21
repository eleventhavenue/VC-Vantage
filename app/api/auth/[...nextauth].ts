//app/api/auth/[...nextauth].ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google"

const prisma = new PrismaClient()

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error("No user found with the given email")
        }

        // Ensure user.password is a string
        if (!user.password) {
            throw new Error("No password set for this user.");
          }
        // Compare hashed password
        const isValid = await compare(credentials!.password, user.password)

        if (!isValid) {
          throw new Error("Invalid password")
        }

        // Return user object (omit password)
        return { id: user.id, name: user.name, email: user.email }
      },
      
    }),
    // You can add more providers here
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth", // Redirect to your custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,
})
