// app/api/user/usage-status/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

const TRIAL_LIMIT = 5;
const MONTHLY_LIMIT = 30;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if we need to reset monthly usage
    const shouldResetMonthly = user.lastUsageReset && 
      new Date(user.lastUsageReset).getMonth() !== new Date().getMonth();

    if (shouldResetMonthly) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyUsageCount: 0,
          lastUsageReset: new Date()
        }
      });
      user.monthlyUsageCount = 0;
    }

    return NextResponse.json({
      isSubscribed: user.isSubscribed,
      usageCount: user.isSubscribed ? user.monthlyUsageCount : user.trialUsageCount,
      maxCount: user.isSubscribed ? MONTHLY_LIMIT : TRIAL_LIMIT,
      subscriptionEnds: user.subscriptionEnds,
      lastReset: user.lastUsageReset
    });

  } catch (error) {
    console.error('Error fetching usage status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage status' },
      { status: 500 }
    );
  }
}