CREATE TYPE "public"."AttendanceStatus" AS ENUM('PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY');--> statement-breakpoint
CREATE TYPE "public"."Gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."PaymentMode" AS ENUM('CASH', 'UPI', 'CHEQUE', 'ONLINE');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('SUPERADMIN', 'ADMIN', 'STUDENT', 'TEACHER');--> statement-breakpoint
CREATE TABLE "AcademicSession" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	CONSTRAINT "AcademicSession_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ActivityLog" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"action" text NOT NULL,
	"details" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"classId" text NOT NULL,
	"date" date NOT NULL,
	"status" "AttendanceStatus" DEFAULT 'PRESENT' NOT NULL,
	"markedById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Attendance_studentId_date_key" UNIQUE("studentId","date")
);
--> statement-breakpoint
CREATE TABLE "Class" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "Class_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "Exam" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"classId" text NOT NULL,
	"sessionId" text,
	"startDate" timestamp,
	"endDate" timestamp,
	"isPublished" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "FeePayment" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"receiptNo" text NOT NULL,
	"mode" "PaymentMode" DEFAULT 'CASH' NOT NULL,
	"receivedById" text,
	"remarks" text,
	CONSTRAINT "FeePayment_receiptNo_unique" UNIQUE("receiptNo")
);
--> statement-breakpoint
CREATE TABLE "FeeStructure" (
	"id" text PRIMARY KEY NOT NULL,
	"classId" text NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"frequency" text DEFAULT 'MONTHLY' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Mark" (
	"id" text PRIMARY KEY NOT NULL,
	"examId" text NOT NULL,
	"studentId" text NOT NULL,
	"subjectId" text NOT NULL,
	"marksObtained" numeric(6, 2) NOT NULL,
	"maxMarks" numeric(6, 2) DEFAULT '100' NOT NULL,
	"grade" text,
	"remarks" text,
	CONSTRAINT "Mark_examId_studentId_subjectId_key" UNIQUE("examId","studentId","subjectId")
);
--> statement-breakpoint
CREATE TABLE "Notice" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"targetRole" "Role",
	"targetClassId" text,
	"createdById" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Section" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"classId" text NOT NULL,
	CONSTRAINT "Section_classId_name_key" UNIQUE("classId","name")
);
--> statement-breakpoint
CREATE TABLE "Setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Student" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"admissionNo" text NOT NULL,
	"classId" text NOT NULL,
	"sectionId" text,
	"rollNo" integer,
	"dob" timestamp,
	"gender" "Gender",
	"bloodGroup" text,
	"photo" text,
	"address" text,
	"fatherName" text,
	"motherName" text,
	"parentPhone" text,
	"admissionDate" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Student_userId_unique" UNIQUE("userId"),
	CONSTRAINT "Student_admissionNo_unique" UNIQUE("admissionNo")
);
--> statement-breakpoint
CREATE TABLE "Subject" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"classId" text NOT NULL,
	CONSTRAINT "Subject_classId_name_key" UNIQUE("classId","name")
);
--> statement-breakpoint
CREATE TABLE "Teacher" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"employeeId" text NOT NULL,
	"qualification" text,
	"phone" text,
	"photo" text,
	CONSTRAINT "Teacher_userId_unique" UNIQUE("userId"),
	CONSTRAINT "Teacher_employeeId_unique" UNIQUE("employeeId")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "Role" DEFAULT 'STUDENT' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedById_User_id_fk" FOREIGN KEY ("markedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_classId_Class_id_fk" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_sessionId_AcademicSession_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."AcademicSession"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_receivedById_User_id_fk" FOREIGN KEY ("receivedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_classId_Class_id_fk" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_examId_Exam_id_fk" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_subjectId_Subject_id_fk" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_targetClassId_Class_id_fk" FOREIGN KEY ("targetClassId") REFERENCES "public"."Class"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_createdById_User_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Section" ADD CONSTRAINT "Section_classId_Class_id_fk" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_Class_id_fk" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Student" ADD CONSTRAINT "Student_sectionId_Section_id_fk" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_classId_Class_id_fk" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Attendance_classId_date_idx" ON "Attendance" USING btree ("classId","date");--> statement-breakpoint
CREATE INDEX "FeePayment_studentId_idx" ON "FeePayment" USING btree ("studentId");--> statement-breakpoint
CREATE INDEX "Notice_targetRole_targetClassId_idx" ON "Notice" USING btree ("targetRole","targetClassId");--> statement-breakpoint
CREATE INDEX "Student_classId_sectionId_idx" ON "Student" USING btree ("classId","sectionId");