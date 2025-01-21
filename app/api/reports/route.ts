// app/api/reports/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  // 1. Check auth
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // 2. Find user
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 3. Retrieve user's saved reports
  const reports = await prisma.report.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    // or select fields if you prefer
  });

  return NextResponse.json(reports, { status: 200 });
}

export async function POST(request: NextRequest) {
  // 1. Check auth
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // 2. Find user
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 3. Create a new report
  const body = await request.json();
  const { query, type, overview, marketAnalysis, financialAnalysis, strategicAnalysis, summary, keyQuestions } = body;

  const savedReport = await prisma.report.create({
    data: {
      userId: user.id,
      query,
      type,
      overview,
      marketAnalysis,
      financialAnalysis,
      strategicAnalysis,
      summary,
      keyQuestions,
    },
  });

  return NextResponse.json(savedReport, { status: 201 });
}
