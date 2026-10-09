-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "type" SET DEFAULT 'Family';

-- Update existing records
UPDATE "Project" SET "type" = 'Family' WHERE "type" != 'Family';
