/*
  Warnings:

  - You are about to drop the `teacher_department_positions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "academic"."teacher_department_positions" DROP CONSTRAINT "teacher_department_positions_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "academic"."teacher_department_positions" DROP CONSTRAINT "teacher_department_positions_positionId_fkey";

-- DropForeignKey
ALTER TABLE "academic"."teacher_department_positions" DROP CONSTRAINT "teacher_department_positions_teacherId_fkey";

-- DropTable
DROP TABLE "academic"."teacher_department_positions";

-- CreateTable
CREATE TABLE "academic"."teacher_department_position" (
    "id" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "positionId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "teacher_department_position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_department_position_teacherId_departmentId_position_key" ON "academic"."teacher_department_position"("teacherId", "departmentId", "positionId");

-- AddForeignKey
ALTER TABLE "academic"."teacher_department_position" ADD CONSTRAINT "teacher_department_position_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "academic"."positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teacher_department_position" ADD CONSTRAINT "teacher_department_position_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "academic"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teacher_department_position" ADD CONSTRAINT "teacher_department_position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
