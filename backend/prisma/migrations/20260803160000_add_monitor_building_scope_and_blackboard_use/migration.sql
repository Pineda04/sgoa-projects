CREATE TYPE "academic"."DigitalBlackboardUseStatus" AS ENUM ('USED', 'NOT_USED', 'UNKNOWN');

CREATE TABLE "auth"."monitor_building_assignments" (
    "monitorId" UUID NOT NULL,
    "buildingId" UUID NOT NULL,
    CONSTRAINT "monitor_building_assignments_pkey" PRIMARY KEY ("monitorId", "buildingId")
);

ALTER TABLE "academic"."schedule_compliance_checks"
ADD COLUMN "digitalBlackboardUseStatus" "academic"."DigitalBlackboardUseStatus",
ADD COLUMN "buildingId" UUID;

UPDATE "academic"."schedule_compliance_checks" AS checks
SET "buildingId" = classrooms."buildingId"
FROM "academic"."course_classrooms" AS sections
JOIN "infraestructure"."classrooms" AS classrooms
  ON classrooms."id" = sections."classroomId"
WHERE checks."courseClassroomId" = sections."id";

ALTER TABLE "academic"."schedule_compliance_checks"
ALTER COLUMN "buildingId" SET NOT NULL;

CREATE INDEX "monitor_building_assignments_buildingId_idx"
ON "auth"."monitor_building_assignments"("buildingId");

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "academic"."schedule_compliance_checks"
        WHERE "offlineId" IS NOT NULL
        GROUP BY "monitorId", "offlineId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate monitor offline IDs require manual remediation before this migration can continue.';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "academic"."schedule_compliance_checks"
        GROUP BY "courseClassroomId", "checkDate"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Multiple checks for one course section and date require manual remediation before this migration can continue.';
    END IF;
END $$;

DROP INDEX "academic"."schedule_compliance_checks_courseClassroomId_checkDate_chec_key";

CREATE UNIQUE INDEX "schedule_compliance_checks_courseClassroomId_checkDate_key"
ON "academic"."schedule_compliance_checks"("courseClassroomId", "checkDate");

CREATE UNIQUE INDEX "schedule_compliance_checks_monitorId_offlineId_key"
ON "academic"."schedule_compliance_checks"("monitorId", "offlineId");

CREATE INDEX "schedule_compliance_checks_buildingId_checkDate_idx"
ON "academic"."schedule_compliance_checks"("buildingId", "checkDate");

ALTER TABLE "auth"."monitor_building_assignments"
ADD CONSTRAINT "monitor_building_assignments_monitorId_fkey"
FOREIGN KEY ("monitorId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth"."monitor_building_assignments"
ADD CONSTRAINT "monitor_building_assignments_buildingId_fkey"
FOREIGN KEY ("buildingId") REFERENCES "infraestructure"."buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "academic"."schedule_compliance_checks"
ADD CONSTRAINT "schedule_compliance_checks_buildingId_fkey"
FOREIGN KEY ("buildingId") REFERENCES "infraestructure"."buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
