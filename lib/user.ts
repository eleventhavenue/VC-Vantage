// lib/user.ts

import prisma from "@/lib/prisma";

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      emailVerified: true,
      role: true,
      isSubscribed: true,
      trialUsageCount: true,
      monthlyUsageCount: true
    }
  });
}

export async function createUser(email: string, password: string) {
  const user = await prisma.user.create({
    data: {
      email,
      password,
      role: "USER" // Set default role
    }
  });
  return { ...user, id: user.id.toString() };
}