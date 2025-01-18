// app/api/user/search-history/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searches = await prisma.report.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      select: {
        id: true,
        query: true,
        type: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to most recent 10 searches
    });

    return NextResponse.json({ searches });

  } catch (error) {
    console.error('Search history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}