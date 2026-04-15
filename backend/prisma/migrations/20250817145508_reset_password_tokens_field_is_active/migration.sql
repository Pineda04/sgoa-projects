-- AlterTable
ALTER TABLE "auth"."reset_password_tokens" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
