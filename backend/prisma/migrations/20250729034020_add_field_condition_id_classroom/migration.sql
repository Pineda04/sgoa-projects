-- AlterTable
ALTER TABLE "infraestructure"."classrooms" ADD COLUMN     "conditionId" UUID;

-- AddForeignKey
ALTER TABLE "infraestructure"."classrooms" ADD CONSTRAINT "classrooms_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "inventory"."conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
