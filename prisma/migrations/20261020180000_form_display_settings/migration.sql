-- CreateEnum
CREATE TYPE "DisplayMode" AS ENUM ('CLASSIC', 'FOCUS');

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "displayMode" "DisplayMode" NOT NULL DEFAULT 'CLASSIC',
ADD COLUMN     "multiPageForm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showProgress" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "submitButtonText" TEXT NOT NULL DEFAULT 'Submit';

