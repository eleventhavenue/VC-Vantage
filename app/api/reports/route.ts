// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.json();
  const { overview, marketAnalysis, financialAnalysis, strategicAnalysis, summary, keyQuestions } = body;

  // Possibly also require 'query', 'type', etc.
  const savedReport = await prisma.report.create({
    data: {
      userId: user.id,
      query: body.query,
      type: body.type,
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
