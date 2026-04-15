/*
  Warnings:

  - You are about to drop the column `Id` on the `modalities` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `modalities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `modalities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "academic"."modalities" DROP COLUMN "Id",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "modalities_name_key" ON "academic"."modalities"("name");
