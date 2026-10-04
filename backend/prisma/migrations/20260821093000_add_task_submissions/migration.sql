-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'REVIEWED');

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" INTEGER,
    "feedback" TEXT,
    "studentId" TEXT NOT NULL,
    "learningTaskId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_studentId_submittedAt_idx" ON "Submission"("studentId", "submittedAt");

-- CreateIndex
CREATE INDEX "Submission_learningTaskId_status_idx" ON "Submission"("learningTaskId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_studentId_learningTaskId_key" ON "Submission"("studentId", "learningTaskId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_learningTaskId_fkey" FOREIGN KEY ("learningTaskId") REFERENCES "LearningTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
