import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Delete the user and all related data (Prisma will handle cascading deletes)
    await prisma.user.delete({
      where: {
        email: session.user.email,
      },
    });

    return NextResponse.json({
      message: 'Account successfully deleted',
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting your account' },
      { status: 500 }
    );
  }
}
