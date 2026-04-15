-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "academic";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "infraestructure";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory";

-- CreateTable
CREATE TABLE "auth"."roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."users" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT,
    "hash" TEXT NOT NULL,
    "hashedRt" TEXT,
    "roleId" UUID NOT NULL,
    "teacherId" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."teachers" (
    "id" UUID NOT NULL,
    "undergradId" UUID,
    "postgradId" UUID,
    "categoryId" UUID NOT NULL,
    "contractTypeId" UUID NOT NULL,
    "shiftId" UUID NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."undergraduate_degrees" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "undergraduate_degrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."postgraduate_degrees" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "postgraduate_degrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."teacher_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "teacher_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."contract_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."shifts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."centers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."faculties" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."departments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "uvs" INTEGER NOT NULL,
    "centerId" UUID NOT NULL,
    "facultyId" UUID NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."courses" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "uvs" INTEGER NOT NULL,
    "departmentId" UUID NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."teacher_department_positions" (
    "id" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "positionId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "teacher_department_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."positions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infraestructure"."buildings" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "floors" INTEGER,
    "centerId" UUID NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infraestructure"."classrooms" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "desks" INTEGER NOT NULL,
    "tables" INTEGER NOT NULL,
    "powerOutlets" INTEGER NOT NULL,
    "lights" INTEGER NOT NULL,
    "blackboards" INTEGER NOT NULL,
    "lecterns" INTEGER NOT NULL,
    "windows" INTEGER NOT NULL,
    "buildingId" UUID NOT NULL,
    "roomTypeId" UUID NOT NULL,
    "connectivityId" UUID,
    "audioEquipmentId" UUID,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infraestructure"."room_types" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."connectivities" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "connectivities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."audio_equipments" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "audio_equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."brands" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."conditions" (
    "id" UUID NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."air_conditioners" (
    "id" UUID NOT NULL,
    "description" TEXT,
    "brandId" UUID NOT NULL,
    "conditionId" UUID NOT NULL,
    "spaceId" UUID,

    CONSTRAINT "air_conditioners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."pc_equipments" (
    "id" UUID NOT NULL,
    "inventoryNumber" TEXT NOT NULL,
    "processor" TEXT NOT NULL,
    "ram" TEXT NOT NULL,
    "disk" TEXT NOT NULL,
    "brandId" UUID NOT NULL,
    "conditionId" UUID NOT NULL,
    "monitorTypeId" UUID NOT NULL,
    "monitorSizeId" UUID NOT NULL,
    "pcTypeId" UUID NOT NULL,
    "spaceId" UUID,
    "departmentId" UUID,

    CONSTRAINT "pc_equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."monitor_types" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "monitor_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."monitor_sizes" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "monitor_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."pc_types" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "pc_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."course_classrooms" (
    "id" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "classroomId" UUID NOT NULL,
    "assignmentReportId" UUID NOT NULL,
    "startHour" TIMESTAMP(3) NOT NULL,
    "endHour" TIMESTAMP(3) NOT NULL,
    "studentCount" INTEGER NOT NULL,
    "modalityId" UUID NOT NULL,
    "nearGraduation" BOOLEAN NOT NULL,
    "groupCode" TEXT NOT NULL DEFAULT 'G1',

    CONSTRAINT "course_classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."modalities" (
    "id" UUID NOT NULL,
    "Id" TEXT NOT NULL,

    CONSTRAINT "modalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."academic_assignment_reports" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "pac" TEXT NOT NULL,
    "teacherId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,

    CONSTRAINT "academic_assignment_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."teaching_sessions" (
    "id" UUID NOT NULL,
    "consultHour" TIMESTAMP(3) NOT NULL,
    "tutoringHour" TIMESTAMP(3) NOT NULL,
    "APB" INTEGER NOT NULL,
    "RPB" INTEGER NOT NULL,
    "NSP" INTEGER NOT NULL,
    "ABD" INTEGER NOT NULL,
    "courseClassroomId" UUID NOT NULL,

    CONSTRAINT "teaching_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."complementary_activities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isRegistered" BOOLEAN NOT NULL,
    "fileNumber" TEXT NOT NULL,
    "progressLevel" TEXT NOT NULL,
    "assignmentReportId" UUID NOT NULL,
    "activityTypeId" UUID NOT NULL,

    CONSTRAINT "complementary_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."activity_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "activity_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."verification_medias" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "multimediaTypeId" UUID NOT NULL,
    "activityId" UUID NOT NULL,

    CONSTRAINT "verification_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic"."multimedia_types" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "multimedia_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_code_key" ON "auth"."users"("code");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_department_positions_teacherId_departmentId_positio_key" ON "academic"."teacher_department_positions"("teacherId", "departmentId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "course_classrooms_courseId_classroomId_assignmentReportId_g_key" ON "academic"."course_classrooms"("courseId", "classroomId", "assignmentReportId", "groupCode");

-- AddForeignKey
ALTER TABLE "auth"."users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "auth"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."users" ADD CONSTRAINT "users_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "academic"."teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teachers" ADD CONSTRAINT "teachers_undergradId_fkey" FOREIGN KEY ("undergradId") REFERENCES "academic"."undergraduate_degrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teachers" ADD CONSTRAINT "teachers_postgradId_fkey" FOREIGN KEY ("postgradId") REFERENCES "academic"."postgraduate_degrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teachers" ADD CONSTRAINT "teachers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "academic"."teacher_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teachers" ADD CONSTRAINT "teachers_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "academic"."contract_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teachers" ADD CONSTRAINT "teachers_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "academic"."shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."departments" ADD CONSTRAINT "departments_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "academic"."centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."departments" ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "academic"."faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."courses" ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teacher_department_positions" ADD CONSTRAINT "teacher_department_positions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "academic"."positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teacher_department_positions" ADD CONSTRAINT "teacher_department_positions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "academic"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teacher_department_positions" ADD CONSTRAINT "teacher_department_positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructure"."buildings" ADD CONSTRAINT "buildings_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "academic"."centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructure"."classrooms" ADD CONSTRAINT "classrooms_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "infraestructure"."buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructure"."classrooms" ADD CONSTRAINT "classrooms_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "infraestructure"."room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructure"."classrooms" ADD CONSTRAINT "classrooms_connectivityId_fkey" FOREIGN KEY ("connectivityId") REFERENCES "inventory"."connectivities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraestructure"."classrooms" ADD CONSTRAINT "classrooms_audioEquipmentId_fkey" FOREIGN KEY ("audioEquipmentId") REFERENCES "inventory"."audio_equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."air_conditioners" ADD CONSTRAINT "air_conditioners_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "inventory"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."air_conditioners" ADD CONSTRAINT "air_conditioners_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "inventory"."conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."air_conditioners" ADD CONSTRAINT "air_conditioners_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "infraestructure"."classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."pc_equipments" ADD CONSTRAINT "pc_equipments_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "inventory"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."pc_equipments" ADD CONSTRAINT "pc_equipments_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "inventory"."conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."pc_equipments" ADD CONSTRAINT "pc_equipments_monitorTypeId_fkey" FOREIGN KEY ("monitorTypeId") REFERENCES "inventory"."monitor_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."pc_equipments" ADD CONSTRAINT "pc_equipments_monitorSizeId_fkey" FOREIGN KEY ("monitorSizeId") REFERENCES "inventory"."monitor_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."pc_equipments" ADD CONSTRAINT "pc_equipments_pcTypeId_fkey" FOREIGN KEY ("pcTypeId") REFERENCES "inventory"."pc_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."course_classrooms" ADD CONSTRAINT "course_classrooms_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "academic"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."course_classrooms" ADD CONSTRAINT "course_classrooms_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "infraestructure"."classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."course_classrooms" ADD CONSTRAINT "course_classrooms_assignmentReportId_fkey" FOREIGN KEY ("assignmentReportId") REFERENCES "academic"."academic_assignment_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."course_classrooms" ADD CONSTRAINT "course_classrooms_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "academic"."modalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."academic_assignment_reports" ADD CONSTRAINT "academic_assignment_reports_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."academic_assignment_reports" ADD CONSTRAINT "academic_assignment_reports_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "academic"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."teaching_sessions" ADD CONSTRAINT "teaching_sessions_courseClassroomId_fkey" FOREIGN KEY ("courseClassroomId") REFERENCES "academic"."course_classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."complementary_activities" ADD CONSTRAINT "complementary_activities_assignmentReportId_fkey" FOREIGN KEY ("assignmentReportId") REFERENCES "academic"."academic_assignment_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."complementary_activities" ADD CONSTRAINT "complementary_activities_activityTypeId_fkey" FOREIGN KEY ("activityTypeId") REFERENCES "academic"."activity_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."verification_medias" ADD CONSTRAINT "verification_medias_multimediaTypeId_fkey" FOREIGN KEY ("multimediaTypeId") REFERENCES "academic"."multimedia_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic"."verification_medias" ADD CONSTRAINT "verification_medias_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "academic"."complementary_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
