/*
  Warnings:

  - Added the required column `projectors` to the `classrooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "infraestructure"."classrooms" ADD COLUMN     "projectors" INTEGER NOT NULL;
