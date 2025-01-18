-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionEnds" TIMESTAMP(3),
ADD COLUMN     "subscriptionTier" TEXT,
ADD COLUMN     "trialUsageCount" INTEGER NOT NULL DEFAULT 0;
