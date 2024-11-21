// types/next-auth.d.ts

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    // Add other custom properties here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    // Add other custom properties here
  }
}
