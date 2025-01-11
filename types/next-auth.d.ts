// types/next-auth.d.ts

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      emailVerified?: Date | null;
    };
    hasProfile: boolean;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
    lastLogin?: Date | null;
    Profile?: {
      id: string;
      role: string;
      firmName: string;
      firmSize: string;
      investmentFocus: string[];
      dealStages: string[];
      investmentSize?: string;
      completedAt: Date;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    emailVerified?: Date | null;
    hasProfile?: boolean;
  }
}