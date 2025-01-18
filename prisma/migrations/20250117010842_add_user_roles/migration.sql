-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'TEST_USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
