/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `activity_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[description]` on the table `multimedia_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activity_types_name_key" ON "academic"."activity_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "multimedia_types_description_key" ON "academic"."multimedia_types"("description");
