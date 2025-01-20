// app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  // Safely handle the possibility that `context.params` might not exist
  const { id } = context.params ?? {};

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing report id.' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: { feedbacks: true },
    });

    if (!report || report.userId !== user.id) {
      return NextResponse.json(
        { error: 'Report not found or does not belong to the user.' },
        { status: 404 }
      );
    }

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('Error fetching report:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
