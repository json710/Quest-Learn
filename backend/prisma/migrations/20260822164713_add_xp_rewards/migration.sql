/*
  Warnings:

  - You are about to drop the column `enrollmentId` on the `Quiz` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "XpRewardType" AS ENUM ('QUIZ_ATTEMPT', 'TASK_REVIEW');

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_enrollmentId_fkey";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "enrollmentId";

-- CreateTable
CREATE TABLE "XpReward" (
    "id" TEXT NOT NULL,
    "type" "XpRewardType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "xpAfter" INTEGER NOT NULL,
    "levelBefore" INTEGER NOT NULL,
    "levelAfter" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "quizAttemptId" TEXT,
    "submissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XpReward_quizAttemptId_key" ON "XpReward"("quizAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "XpReward_submissionId_key" ON "XpReward"("submissionId");

-- CreateIndex
CREATE INDEX "XpReward_userId_createdAt_idx" ON "XpReward"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "XpReward_type_idx" ON "XpReward"("type");

-- AddForeignKey
ALTER TABLE "XpReward" ADD CONSTRAINT "XpReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpReward" ADD CONSTRAINT "XpReward_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "QuizAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpReward" ADD CONSTRAINT "XpReward_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
