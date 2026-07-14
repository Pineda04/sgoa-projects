-- AlterTable
ALTER TABLE "infraestructure"."classrooms" ADD COLUMN     "activeStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "digitalWhiteboardId" UUID;

-- CreateTable
CREATE TABLE "inventory"."digital_whiteboards" (
    "id" UUID NOT NULL,
    "description" TEXT,
    "brandId" UUID NOT NULL,
    "monitorTypeId" UUID NOT NULL,
    "monitorSizeId" UUID NOT NULL,
    "conditionId" UUID NOT NULL,

    CONSTRAINT "digital_whiteboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infraestructure"."classrooms_departments" (
    "id" UUID NOT NULL,
    "classroomId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_departments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventory"."digital_whiteboards" ADD CONSTRAINT "digital_whiteboards_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "inventory"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."digital_whiteboards" ADD CONSTRAINT "digital_whiteboards_monitorTypeId_fkey" FOREIGN KEY ("monitorTypeId") REFERENCES "inventory"."monitor_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."digital_whiteboards" ADD CONSTRAINT "digital_whiteboards_monitorSizeId_fkey" FOREIGN KEY ("monitorSizeId") REFERENCES "inventory"."monitor_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."digital_whiteboards" ADD CONSTRAINT "digital_whiteboards_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "inventory"."conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructure"."classrooms_departments" ADD CONSTRAINT "classrooms_departments_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "infraestructure"."classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructure"."classrooms_departments" ADD CONSTRAINT "classrooms_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructure"."classrooms" ADD CONSTRAINT "classrooms_digitalWhiteboardId_fkey" FOREIGN KEY ("digitalWhiteboardId") REFERENCES "inventory"."digital_whiteboards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
