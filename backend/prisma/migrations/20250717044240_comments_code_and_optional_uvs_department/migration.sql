/*
  Warnings:

  - You are about to drop the column `codigo` on the `departments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "academic"."departments" DROP COLUMN "codigo",
ALTER COLUMN "uvs" DROP NOT NULL;
