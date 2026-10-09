-- AlterTable
ALTER TABLE "ProjectInvite" ADD COLUMN "lastSentAt" TIMESTAMP(3);
ALTER TABLE "ProjectInvite" ADD COLUMN "sendFailureCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProjectInvite" ADD COLUMN "lastSendError" TEXT;
