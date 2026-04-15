/*
  Warnings:

  - You are about to drop the column `multimediaTypeId` on the `verification_medias` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `verification_medias` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "academic"."verification_medias" DROP CONSTRAINT "verification_medias_multimediaTypeId_fkey";

-- AlterTable
ALTER TABLE "academic"."verification_medias" DROP COLUMN "multimediaTypeId",
DROP COLUMN "url";

-- CreateTable
CREATE TABLE "academic"."verification_media_files" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "multimediaTypeId" UUID NOT NULL,
    "verificationMediaId" UUID NOT NULL,

    CONSTRAINT "verification_media_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "academic"."verification_media_files" ADD CONSTRAINT "verification_media_files_multimediaTypeId_fkey" FOREIGN KEY ("multimediaTypeId") REFERENCES "academic"."multimedia_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."verification_media_files" ADD CONSTRAINT "verification_media_files_verificationMediaId_fkey" FOREIGN KEY ("verificationMediaId") REFERENCES "academic"."verification_medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
