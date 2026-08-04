-- Keep the first historical verification when a class was checked more than
-- once on the same day, then enforce the business key used by offline sync.
DELETE FROM "academic"."schedule_compliance_checks" AS duplicate
USING "academic"."schedule_compliance_checks" AS original
WHERE duplicate."courseClassroomId" = original."courseClassroomId"
  AND duplicate."checkDate" = original."checkDate"
  AND (
    duplicate."createdAt" > original."createdAt"
    OR (duplicate."createdAt" = original."createdAt" AND duplicate."id" > original."id")
  );

DROP INDEX "academic"."schedule_compliance_checks_courseClassroomId_checkDate_chec_key";

CREATE UNIQUE INDEX "schedule_compliance_checks_courseClassroomId_checkDate_key"
ON "academic"."schedule_compliance_checks"("courseClassroomId", "checkDate");
