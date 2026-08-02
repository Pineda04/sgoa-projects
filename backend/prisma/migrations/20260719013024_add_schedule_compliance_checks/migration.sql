-- CreateTable
CREATE TABLE "academic"."schedule_compliance_checks" (
    "id" UUID NOT NULL,
    "courseClassroomId" UUID NOT NULL,
    "monitorId" UUID NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL,
    "checkTime" TEXT NOT NULL,
    "isPresent" BOOLEAN NOT NULL,
    "observation" TEXT,
    "offlineId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_compliance_checks_monitorId_checkDate_idx" ON "academic"."schedule_compliance_checks"("monitorId", "checkDate");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_compliance_checks_courseClassroomId_checkDate_chec_key" ON "academic"."schedule_compliance_checks"("courseClassroomId", "checkDate", "checkTime");

-- AddForeignKey
ALTER TABLE "academic"."schedule_compliance_checks" ADD CONSTRAINT "schedule_compliance_checks_courseClassroomId_fkey" FOREIGN KEY ("courseClassroomId") REFERENCES "academic"."course_classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."schedule_compliance_checks" ADD CONSTRAINT "schedule_compliance_checks_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
