// lib/user.ts

import prisma from "@/lib/prisma";

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(email: string, password: string) {
  const user = await prisma.user.create({
    data: { email, password },
  });
  return { ...user, id: user.id.toString() }; // Ensure id is a string
}
