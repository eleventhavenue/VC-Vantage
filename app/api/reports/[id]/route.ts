// app/api/reports/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { RouteHandlerContext } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// 1. Define a custom interface that extends `RouteHandlerContext`
interface ReportsContext extends RouteHandlerContext {
  params: {
    id: string; // Matches your `[id]` segment
  };
}

// 2. Use that interface in the second argument
export async function GET(req: NextRequest, { params }: ReportsContext) {
  try {
    const { id } = params;

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
