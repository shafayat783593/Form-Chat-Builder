-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'TEXTAREA';
ALTER TYPE "QuestionType" ADD VALUE 'NUMBER';
ALTER TYPE "QuestionType" ADD VALUE 'PHONE';
ALTER TYPE "QuestionType" ADD VALUE 'DATE';
ALTER TYPE "QuestionType" ADD VALUE 'RADIO';
ALTER TYPE "QuestionType" ADD VALUE 'CHECKBOX';
ALTER TYPE "QuestionType" ADD VALUE 'RATING';
ALTER TYPE "QuestionType" ADD VALUE 'RANGE';
ALTER TYPE "QuestionType" ADD VALUE 'NPS';
ALTER TYPE "QuestionType" ADD VALUE 'ADDRESS';
ALTER TYPE "QuestionType" ADD VALUE 'FULL_NAME';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "fontSize" INTEGER,
ADD COLUMN     "fontStyle" TEXT,
ADD COLUMN     "fontWeight" TEXT,
ADD COLUMN     "placeholder" TEXT,
ADD COLUMN     "textColor" TEXT;

