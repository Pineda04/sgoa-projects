/*
  Warnings:

  - The primary key for the `center_departments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `departmentId` on the `teacher_department_position` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[centerId,departmentId]` on the table `center_departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId,centerDepartmentId]` on the table `teacher_department_position` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `center_departments` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `centerDepartmentId` to the `teacher_department_position` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "academic"."teacher_department_position" DROP CONSTRAINT "teacher_department_position_departmentId_fkey";

-- DropIndex
DROP INDEX "academic"."teacher_department_position_teacherId_departmentId_key";

-- DropIndex
DROP INDEX "academic"."teacher_department_position_teacherId_departmentId_position_key";

-- AlterTable
ALTER TABLE "academic"."center_departments" DROP CONSTRAINT "center_departments_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "center_departments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "academic"."teacher_department_position" DROP COLUMN "departmentId",
ADD COLUMN     "centerDepartmentId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "center_departments_centerId_departmentId_key" ON "academic"."center_departments"("centerId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_department_position_teacherId_centerDepartmentId_key" ON "academic"."teacher_department_position"("teacherId", "centerDepartmentId");

-- AddForeignKey
ALTER TABLE "academic"."teacher_department_position" ADD CONSTRAINT "teacher_department_position_centerDepartmentId_fkey" FOREIGN KEY ("centerDepartmentId") REFERENCES "academic"."center_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
