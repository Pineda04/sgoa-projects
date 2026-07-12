-- DropForeignKey
ALTER TABLE "infraestructure"."classrooms" DROP CONSTRAINT "classrooms_digitalWhiteboardId_fkey";
ALTER TABLE "inventory"."digital_whiteboards" DROP CONSTRAINT "digital_whiteboards_brandId_fkey";
ALTER TABLE "inventory"."digital_whiteboards" DROP CONSTRAINT "digital_whiteboards_conditionId_fkey";
ALTER TABLE "inventory"."digital_whiteboards" DROP CONSTRAINT "digital_whiteboards_monitorSizeId_fkey";
ALTER TABLE "inventory"."digital_whiteboards" DROP CONSTRAINT "digital_whiteboards_monitorTypeId_fkey";

-- RenameTable
ALTER TABLE IF EXISTS "inventory"."digital_whiteboards" RENAME TO "digital_blackboards";

-- RenameColumn in classrooms
ALTER TABLE "infraestructure"."classrooms" RENAME COLUMN "digitalWhiteboardId" TO "digitalBlackboardId";

-- Drop old PK constraint name and recreate with new name
ALTER TABLE "inventory"."digital_blackboards" DROP CONSTRAINT "digital_whiteboards_pkey";
ALTER TABLE "inventory"."digital_blackboards" ADD CONSTRAINT "digital_blackboards_pkey" PRIMARY KEY ("id");

-- AddForeignKey (con nuevos nombres de tabla y columna)
ALTER TABLE "inventory"."digital_blackboards" ADD CONSTRAINT "digital_blackboards_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "inventory"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory"."digital_blackboards" ADD CONSTRAINT "digital_blackboards_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "inventory"."conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory"."digital_blackboards" ADD CONSTRAINT "digital_blackboards_monitorSizeId_fkey" FOREIGN KEY ("monitorSizeId") REFERENCES "inventory"."monitor_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory"."digital_blackboards" ADD CONSTRAINT "digital_blackboards_monitorTypeId_fkey" FOREIGN KEY ("monitorTypeId") REFERENCES "inventory"."monitor_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "infraestructure"."classrooms" ADD CONSTRAINT "classrooms_digitalBlackboardId_fkey" FOREIGN KEY ("digitalBlackboardId") REFERENCES "inventory"."digital_blackboards"("id") ON DELETE SET NULL ON UPDATE CASCADE;