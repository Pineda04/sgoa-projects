-- DropForeignKey
ALTER TABLE "academic"."verification_media_files" DROP CONSTRAINT "verification_media_files_verificationMediaId_fkey";

-- DropForeignKey
ALTER TABLE "academic"."verification_medias" DROP CONSTRAINT "verification_medias_activityId_fkey";

-- AddForeignKey
ALTER TABLE "academic"."verification_medias" ADD CONSTRAINT "verification_medias_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "academic"."complementary_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."verification_media_files" ADD CONSTRAINT "verification_media_files_verificationMediaId_fkey" FOREIGN KEY ("verificationMediaId") REFERENCES "academic"."verification_medias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
