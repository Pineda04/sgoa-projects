-- AlterTable
ALTER TABLE "academic"."courses" ADD COLUMN     "activeStatus" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "auth"."users" ADD COLUMN     "activeStatus" BOOLEAN NOT NULL DEFAULT true;
