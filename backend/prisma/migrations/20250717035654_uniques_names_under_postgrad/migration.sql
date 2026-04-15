/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `postgraduate_degrees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `undergraduate_degrees` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "postgraduate_degrees_name_key" ON "academic"."postgraduate_degrees"("name");

-- CreateIndex
CREATE UNIQUE INDEX "undergraduate_degrees_name_key" ON "academic"."undergraduate_degrees"("name");
