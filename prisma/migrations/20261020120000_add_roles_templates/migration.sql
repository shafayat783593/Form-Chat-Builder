-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "WidgetPosition" AS ENUM ('RIGHT', 'LEFT');

-- DropIndex
DROP INDEX "Form_ownerId_idx";

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "launcherLabel" TEXT NOT NULL DEFAULT 'Chat with us',
ADD COLUMN     "notifyEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notifyOnResponse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "sourceTemplateId" TEXT,
ADD COLUMN     "templateCategory" TEXT,
ADD COLUMN     "templateSlug" TEXT,
ADD COLUMN     "widgetPosition" "WidgetPosition" NOT NULL DEFAULT 'RIGHT';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "prefillKey" TEXT;

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'OWNER';

-- CreateIndex
CREATE UNIQUE INDEX "Form_templateSlug_key" ON "Form"("templateSlug");

-- CreateIndex
CREATE INDEX "Form_ownerId_createdAt_idx" ON "Form"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "Form_isTemplate_status_idx" ON "Form"("isTemplate", "status");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

