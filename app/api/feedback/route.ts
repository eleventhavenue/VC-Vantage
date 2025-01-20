// app/api/feedback/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  try {
    const { feedback, reportId } = await req.json();

    if (!feedback || !reportId) {
      return NextResponse.json(
        { error: 'Feedback and report ID are required.' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report || report.userId !== user.id) {
      return NextResponse.json(
        { error: 'Report not found or does not belong to the user.' },
        { status: 404 }
      );
    }

    // Create feedback
    const newFeedback = await prisma.feedback.create({
      data: {
        feedback,
        reportId,
        userId: user.id,
      },
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred.' },
      { status: 500 }
    );
  }
}
