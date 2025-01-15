// app/api/user/update/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust the path as necessary
import prisma from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    // Retrieve the session using NextAuth's getServerSession
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse the incoming JSON payload
    const { name, image } = await req.json();

    // Input Validation (Optional but recommended)
    if (typeof name !== 'string' || typeof image !== 'string') {
      return NextResponse.json({ error: 'Invalid input types' }, { status: 400 });
    }

    // Update the user's name and image in the database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { name, image },
    });

    console.log('User updated successfully:', updatedUser);

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}
