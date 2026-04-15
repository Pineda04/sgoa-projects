/*
  Warnings:

  - You are about to drop the column `teacherId` on the `users` table. All the data in the column will be lost.
  - Added the required column `userId` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "auth"."users" DROP CONSTRAINT "users_teacherId_fkey";

-- AlterTable
ALTER TABLE "academic"."teachers" ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "auth"."users" DROP COLUMN "teacherId",
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "code" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "academic"."teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
