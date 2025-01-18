import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      emailVerified?: Date | null;
      onboardingCompleted?: boolean;  // Add this line
      role?: "USER" | "TEST_USER" | "ADMIN";
      isSubscribed: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
    lastLogin?: Date | null;
    onboardingCompleted?: boolean;  // Optionally add this to user type
    role: "USER" | "TEST_USER" | "ADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    emailVerified?: Date | null;
    onboardingCompleted?: boolean;  // Add to JWT
    role: "USER" | "TEST_USER" | "ADMIN"
  }
}
