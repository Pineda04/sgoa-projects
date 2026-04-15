/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `contract_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `positions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `shifts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `teacher_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contract_types_name_key" ON "academic"."contract_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "academic"."departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "positions_name_key" ON "academic"."positions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_name_key" ON "academic"."shifts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_categories_name_key" ON "academic"."teacher_categories"("name");
