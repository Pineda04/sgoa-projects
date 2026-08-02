/*
  Warnings:

  - You are about to drop the column `digitalBlackboardId` on the `classrooms` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "infraestructure"."classrooms" DROP CONSTRAINT "classrooms_digitalBlackboardId_fkey";

-- AlterTable
ALTER TABLE "infraestructure"."classrooms" DROP COLUMN "digitalBlackboardId";

-- AlterTable
ALTER TABLE "inventory"."digital_blackboards" ADD COLUMN "classroomId" UUID;

-- AddForeignKey
ALTER TABLE "inventory"."digital_blackboards" ADD CONSTRAINT "digital_blackboards_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "infraestructure"."classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
