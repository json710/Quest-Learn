-- CreateEnum
CREATE TYPE "BadgeKey" AS ENUM ('FIRST_QUIZ', 'QUIZ_MASTER', 'FIRST_TASK_REVIEWED', 'LEVEL_2');

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "key" "BadgeKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "sourceId" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("userId","badgeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");

-- CreateIndex
CREATE INDEX "UserBadge_userId_earnedAt_idx" ON "UserBadge"("userId", "earnedAt");

-- CreateIndex
CREATE INDEX "UserBadge_sourceId_idx" ON "UserBadge"("sourceId");

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the initial Sprint 2 badge catalog.
INSERT INTO "Badge" ("id", "key", "name", "description", "requirement", "iconKey")
VALUES
  ('badge_first_quiz', 'FIRST_QUIZ', 'First Steps', 'Completed your first QuestLearn quiz.', 'Submit your first quiz attempt.', 'quiz'),
  ('badge_quiz_master', 'QUIZ_MASTER', 'Quiz Master', 'Demonstrated excellent quiz performance.', 'Score 85% or higher on a quiz.', 'trophy'),
  ('badge_first_task_reviewed', 'FIRST_TASK_REVIEWED', 'Feedback Ready', 'Received your first instructor task review.', 'Have your first learning task reviewed.', 'clipboard'),
  ('badge_level_2', 'LEVEL_2', 'Rising Learner', 'Reached Level 2 through continued learning.', 'Earn 100 total XP and reach Level 2.', 'sparkles');
