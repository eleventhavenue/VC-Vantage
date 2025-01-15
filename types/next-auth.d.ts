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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    emailVerified?: Date | null;
    onboardingCompleted?: boolean;  // Add to JWT
  }
}
