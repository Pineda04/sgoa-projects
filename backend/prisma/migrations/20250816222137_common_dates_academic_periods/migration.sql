-- CreateTable
CREATE TABLE "academic"."common_dates_academic_periods" (
    "id" UUID NOT NULL,
    "pac" INTEGER NOT NULL,
    "pac_modality" TEXT NOT NULL DEFAULT 'Trimestre',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "common_dates_academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "common_dates_academic_periods_pac_key" ON "academic"."common_dates_academic_periods"("pac");
