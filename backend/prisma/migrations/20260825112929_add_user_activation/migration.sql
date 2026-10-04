-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "User_role_isActive_createdAt_idx" ON "User"("role", "isActive", "createdAt");
