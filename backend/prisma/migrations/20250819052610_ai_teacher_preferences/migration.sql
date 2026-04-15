-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ai";

-- CreateTable
CREATE TABLE "ai"."teacher_preferences" (
    "id" UUID NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "teacherId" UUID NOT NULL,

    CONSTRAINT "teacher_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai"."teacher_preferred_classes" (
    "id" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "teacherPreferenceId" UUID NOT NULL,

    CONSTRAINT "teacher_preferred_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_preferences_teacherId_key" ON "ai"."teacher_preferences"("teacherId");

-- AddForeignKey
ALTER TABLE "ai"."teacher_preferences" ADD CONSTRAINT "teacher_preferences_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "academic"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai"."teacher_preferred_classes" ADD CONSTRAINT "teacher_preferred_classes_teacherPreferenceId_fkey" FOREIGN KEY ("teacherPreferenceId") REFERENCES "ai"."teacher_preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai"."teacher_preferred_classes" ADD CONSTRAINT "teacher_preferred_classes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "academic"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
