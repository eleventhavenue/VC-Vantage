// lib/usage-utils.ts

import prisma from '@/lib/prisma';

const TRIAL_LIMIT = 5;
const MONTHLY_LIMIT = 30;

export async function checkAndUpdateUsage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Reset monthly usage if it's a new month
  const shouldResetMonthly = user.lastUsageReset && 
    new Date(user.lastUsageReset).getMonth() !== new Date().getMonth();

  if (shouldResetMonthly) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyUsageCount: 0,
        lastUsageReset: new Date()
      }
    });
    return { canProceed: true, usageCount: 0, limit: MONTHLY_LIMIT };
  }

  if (user.isSubscribed) {
    // Check monthly limit for subscribed users
    if (user.monthlyUsageCount >= MONTHLY_LIMIT) {
      return {
        canProceed: false,
        usageCount: user.monthlyUsageCount,
        limit: MONTHLY_LIMIT,
        error: 'Monthly search limit reached'
      };
    }

    // Increment monthly usage
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyUsageCount: { increment: 1 }
      }
    });

    return {
      canProceed: true,
      usageCount: updatedUser.monthlyUsageCount,
      limit: MONTHLY_LIMIT
    };
  } else {
    // Handle trial users
    if (user.trialUsageCount >= TRIAL_LIMIT) {
      return {
        canProceed: false,
        usageCount: user.trialUsageCount,
        limit: TRIAL_LIMIT,
        error: 'Trial limit reached'
      };
    }

    // Increment trial usage
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        trialUsageCount: { increment: 1 }
      }
    });

    return {
      canProceed: true,
      usageCount: updatedUser.trialUsageCount,
      limit: TRIAL_LIMIT
    };
  }
}