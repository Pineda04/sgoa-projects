-- 1. Agregar columnas como NULL permitido
ALTER TABLE "academic"."academic_periods" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "academic"."academic_periods" ADD COLUMN "endDate" TIMESTAMP(3);

-- 2. Migrar datos existentes de common_dates_academic_periods
UPDATE "academic"."academic_periods" ap
SET "startDate" = cdap."startDate",
    "endDate" = cdap."endDate"
FROM "academic"."common_dates_academic_periods" cdap
WHERE cdap."pac" = ap."pac" AND cdap."pac_modality" = ap."pac_modality";

-- 3. Valor por defecto para periodos sin fechas
UPDATE "academic"."academic_periods"
SET "startDate" = '2025-01-01', "endDate" = '2025-04-30'
WHERE "startDate" IS NULL OR "endDate" IS NULL;

-- 4. Ahora sí hacer NOT NULL
ALTER TABLE "academic"."academic_periods"
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL;

-- 5. Eliminar tabla obsoleta
DROP TABLE "academic"."common_dates_academic_periods";