import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums (SQL type names same rakhe hain) ───────────────────────────
export const roleEnum = pgEnum("Role", ["SUPERADMIN", "ADMIN", "STUDENT", "TEACHER"]);
export const genderEnum = pgEnum("Gender", ["MALE", "FEMALE", "OTHER"]);
export const attendanceStatusEnum = pgEnum("AttendanceStatus", [
  "PRESENT",
  "ABSENT",
  "LEAVE",
  "HALF_DAY",
]);
export const paymentModeEnum = pgEnum("PaymentMode", ["CASH", "UPI", "CHEQUE", "ONLINE"]);

export type Role = (typeof roleEnum.enumValues)[number];

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());

// ── Core Users & RBAC ────────────────────────────────────────────────
export const users = pgTable("User", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("STUDENT"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ── Academic Entities ────────────────────────────────────────────────
export const students = pgTable(
  "Student",
  {
    id: id(),
    userId: text("userId")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    admissionNo: text("admissionNo").notNull().unique(),
    classId: text("classId")
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),
    sectionId: text("sectionId").references(() => sections.id, { onDelete: "set null" }),
    rollNo: integer("rollNo"),
    dob: timestamp("dob", { mode: "date" }),
    gender: genderEnum("gender"),
    bloodGroup: text("bloodGroup"),
    photo: text("photo"),
    address: text("address"),
    fatherName: text("fatherName"),
    motherName: text("motherName"),
    parentPhone: text("parentPhone"),
    admissionDate: timestamp("admissionDate", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("Student_classId_sectionId_idx").on(t.classId, t.sectionId)]
);

export const teachers = pgTable("Teacher", {
  id: id(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  employeeId: text("employeeId").notNull().unique(),
  qualification: text("qualification"),
  phone: text("phone"),
  photo: text("photo"),
});

export const classes = pgTable("Class", {
  id: id(),
  name: text("name").notNull().unique(),
});

export const sections = pgTable(
  "Section",
  {
    id: id(),
    name: text("name").notNull(),
    classId: text("classId")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
  },
  (t) => [unique("Section_classId_name_key").on(t.classId, t.name)]
);

export const subjects = pgTable(
  "Subject",
  {
    id: id(),
    name: text("name").notNull(),
    code: text("code"),
    classId: text("classId")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
  },
  (t) => [unique("Subject_classId_name_key").on(t.classId, t.name)]
);

// ── Attendance ───────────────────────────────────────────────────────
export const attendance = pgTable(
  "Attendance",
  {
    id: id(),
    studentId: text("studentId")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: text("classId").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    status: attendanceStatusEnum("status").notNull().default("PRESENT"),
    markedById: text("markedById").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    unique("Attendance_studentId_date_key").on(t.studentId, t.date),
    index("Attendance_classId_date_idx").on(t.classId, t.date),
  ]
);

// ── Exams & Marks ────────────────────────────────────────────────────
export const academicSessions = pgTable("AcademicSession", {
  id: id(),
  name: text("name").notNull().unique(),
  isActive: boolean("isActive").notNull().default(false),
  startDate: timestamp("startDate", { mode: "date" }).notNull(),
  endDate: timestamp("endDate", { mode: "date" }).notNull(),
});

export const exams = pgTable("Exam", {
  id: id(),
  name: text("name").notNull(),
  classId: text("classId")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  sessionId: text("sessionId").references(() => academicSessions.id, { onDelete: "set null" }),
  startDate: timestamp("startDate", { mode: "date" }),
  endDate: timestamp("endDate", { mode: "date" }),
  isPublished: boolean("isPublished").notNull().default(false),
});

export const marks = pgTable(
  "Mark",
  {
    id: id(),
    examId: text("examId")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    studentId: text("studentId")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    subjectId: text("subjectId")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    marksObtained: numeric("marksObtained", { precision: 6, scale: 2 }).notNull(),
    maxMarks: numeric("maxMarks", { precision: 6, scale: 2 }).notNull().default("100"),
    grade: text("grade"),
    remarks: text("remarks"),
  },
  (t) => [unique("Mark_examId_studentId_subjectId_key").on(t.examId, t.studentId, t.subjectId)]
);

// ── Fees ─────────────────────────────────────────────────────────────
export const feeStructures = pgTable("FeeStructure", {
  id: id(),
  classId: text("classId")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // Tuition / Transport / Exam / Admission
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull().default("MONTHLY"),
});

export const feePayments = pgTable(
  "FeePayment",
  {
    id: id(),
    studentId: text("studentId")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    date: timestamp("date", { mode: "date" }).notNull().defaultNow(),
    receiptNo: text("receiptNo").notNull().unique(),
    mode: paymentModeEnum("mode").notNull().default("CASH"),
    receivedById: text("receivedById").references(() => users.id, { onDelete: "set null" }),
    remarks: text("remarks"),
  },
  (t) => [index("FeePayment_studentId_idx").on(t.studentId)]
);

// ── Notices ──────────────────────────────────────────────────────────
export const notices = pgTable(
  "Notice",
  {
    id: id(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    targetRole: roleEnum("targetRole"),
    targetClassId: text("targetClassId").references(() => classes.id, { onDelete: "set null" }),
    createdById: text("createdById")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("Notice_targetRole_targetClassId_idx").on(t.targetRole, t.targetClassId)]
);

// ── System (Super Admin) ─────────────────────────────────────────────
export const settings = pgTable("Setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const activityLogs = pgTable(
  "ActivityLog",
  {
    id: id(),
    userId: text("userId").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    details: text("details"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("ActivityLog_userId_idx").on(t.userId)]
);

// ── Relations ────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students),
  teacher: one(teachers),
  activityLogs: many(activityLogs),
  markedAttendance: many(attendance),
  notices: many(notices),
  receivedPayments: many(feePayments),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  section: one(sections, { fields: [students.sectionId], references: [sections.id] }),
  attendance: many(attendance),
  marks: many(marks),
  feePayments: many(feePayments),
}));

export const teachersRelations = relations(teachers, ({ one }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  sections: many(sections),
  students: many(students),
  subjects: many(subjects),
  exams: many(exams),
  feeStructures: many(feeStructures),
  notices: many(notices),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  class: one(classes, { fields: [sections.classId], references: [classes.id] }),
  students: many(students),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  class: one(classes, { fields: [subjects.classId], references: [classes.id] }),
  marks: many(marks),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, { fields: [attendance.studentId], references: [students.id] }),
  markedBy: one(users, { fields: [attendance.markedById], references: [users.id] }),
}));

export const academicSessionsRelations = relations(academicSessions, ({ many }) => ({
  exams: many(exams),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  class: one(classes, { fields: [exams.classId], references: [classes.id] }),
  session: one(academicSessions, { fields: [exams.sessionId], references: [academicSessions.id] }),
  marks: many(marks),
}));

export const marksRelations = relations(marks, ({ one }) => ({
  exam: one(exams, { fields: [marks.examId], references: [exams.id] }),
  student: one(students, { fields: [marks.studentId], references: [students.id] }),
  subject: one(subjects, { fields: [marks.subjectId], references: [subjects.id] }),
}));

export const feeStructuresRelations = relations(feeStructures, ({ one }) => ({
  class: one(classes, { fields: [feeStructures.classId], references: [classes.id] }),
}));

export const feePaymentsRelations = relations(feePayments, ({ one }) => ({
  student: one(students, { fields: [feePayments.studentId], references: [students.id] }),
  receivedBy: one(users, { fields: [feePayments.receivedById], references: [users.id] }),
}));

export const noticesRelations = relations(notices, ({ one }) => ({
  createdBy: one(users, { fields: [notices.createdById], references: [users.id] }),
  targetClass: one(classes, { fields: [notices.targetClassId], references: [classes.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));
