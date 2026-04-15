/*
  Warnings:

  - You are about to drop the column `spaceId` on the `air_conditioners` table. All the data in the column will be lost.
  - You are about to drop the column `spaceId` on the `pc_equipments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "inventory"."air_conditioners" DROP CONSTRAINT "air_conditioners_spaceId_fkey";

-- AlterTable
ALTER TABLE "inventory"."air_conditioners" DROP COLUMN "spaceId",
ADD COLUMN     "classroomId" UUID;

-- AlterTable
ALTER TABLE "inventory"."pc_equipments" DROP COLUMN "spaceId",
ADD COLUMN     "classroomId" UUID;

-- AddForeignKey
ALTER TABLE "inventory"."air_conditioners" ADD CONSTRAINT "air_conditioners_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "infraestructure"."classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."pc_equipments" ADD CONSTRAINT "pc_equipments_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "infraestructure"."classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
