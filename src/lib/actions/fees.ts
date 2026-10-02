"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { feePayments, feeStructures, students } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";
import { packRemarks } from "@/lib/fees-calcs";

const MANAGERS = ["ADMIN", "SUPERADMIN"] as const;

// ── Fee Structure (class-wise fee types) ────────────────────────────
const structureSchema = z.object({
  classId: z.string().min(1),
  type: z.string().trim().min(2).max(30),
  amount: z.coerce.number().min(1).max(100000),
  frequency: z.enum(["MONTHLY", "TERM", "ONE_TIME"]),
});

export async function addFeeStructure(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const parsed = structureSchema.safeParse({
    classId: formData.get("classId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
  });
  if (!parsed.success) redirect("/admin/fees/structure?err=" + encodeURIComponent("The details are invalid"));
  const { classId, type, amount, frequency } = parsed.data;

  const existing = await db.query.feeStructures.findMany({ where: eq(feeStructures.classId, classId) });
  if (existing.some((s) => s.type.trim().toLowerCase() === type.toLowerCase())) {
    redirect(`/admin/fees/structure?err=${encodeURIComponent(`"${type}" already exists for that class`)}`);
  }

  await db.insert(feeStructures).values({ classId, type, amount: String(amount), frequency });
  await logActivity(session.user.id, "FEE_STRUCTURE_ADDED", `${type} ₹${amount} (${frequency})`);
  revalidatePath("/admin/fees/structure");
  revalidatePath("/admin/fees/collect");
  redirect(`/admin/fees/structure?added=${encodeURIComponent(type)}`);
}

export async function deleteFeeStructure(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const id = String(formData.get("id") ?? "");
  await db.delete(feeStructures).where(eq(feeStructures.id, id));
  await logActivity(session.user.id, "FEE_STRUCTURE_DELETED", `id ${id}`);
  revalidatePath("/admin/fees/structure");
  redirect("/admin/fees/structure?deleted=1");
}

// ── Payment Collection ──────────────────────────────────────────────
const itemSchema = z.object({
  label: z.string().trim().min(1).max(40),
  amount: z.number().min(1).max(100000),
});

/** Record a payment — one receipt can carry multiple fee items.
 *  Receipt no: RCP-YYYY-##### auto (max existing + 1)
 *  The amount is computed server-side from the items (the client is never trusted). */
export async function recordPayment(formData: FormData) {
  const session = await requireRole(...MANAGERS);

  const studentId = String(formData.get("studentId") ?? "");
  const mode = String(formData.get("mode") ?? "CASH");
  const note = String(formData.get("note") ?? "").slice(0, 120);

  if (!z.enum(["CASH", "UPI", "CHEQUE", "ONLINE"]).safeParse(mode).success) {
    redirect(`/admin/fees/collect/${studentId}?err=Invalid payment mode`);
  }

  let raw: unknown = null;
  try {
    raw = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    raw = null;
  }
  const itemsParsed = z.array(itemSchema).min(1).safeParse(raw ?? []);
  if (!itemsParsed.success) {
    redirect(`/admin/fees/collect/${studentId}?err=Select at least 1 fee item`);
  }
  const items = itemsParsed.data;
  const total = items.reduce((s, i) => s + i.amount, 0);

  // Student verify
  const student = await db.query.students.findFirst({
    where: eq(students.id, studentId),
    with: { user: true },
  });
  if (!student) redirect("/admin/fees/collect?err=" + encodeURIComponent("Student not found"));

  // Receipt number: RCP-YYYY-##### (counter from existing)
  const year = new Date().getFullYear();
  const [{ max }] = await db
    .select({ max: sql<string | null>`max(${feePayments.receiptNo})` })
    .from(feePayments);
  const lastNum = max?.match(/RCP-\d+-(\d+)/) ? parseInt(max.match(/RCP-\d+-(\d+)/)![1], 10) : 0;
  const receiptNo = `RCP-${year}-${String(lastNum + 1).padStart(5, "0")}`;

  await db.insert(feePayments).values({
    studentId: student.id,
    amount: String(total),
    receiptNo,
    mode: mode as "CASH",
    receivedById: session.user.id,
    remarks: packRemarks(items, note),
  });

  await logActivity(
    session.user.id,
    "PAYMENT_RECORDED",
    `${receiptNo}: ₹${total} from ${student.user.name} (${mode})`
  );
  revalidatePath("/admin/fees");
  revalidatePath("/admin/dashboard");
  revalidatePath("/student/fees");
  revalidatePath("/student/dashboard");
  redirect(`/receipt/${receiptNo}?new=1`);
}

/** Delete a payment (in case of a wrong entry) */
export async function deletePayment(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const id = String(formData.get("id") ?? "");
  const payment = await db.query.feePayments.findFirst({
    where: eq(feePayments.id, id),
    with: { student: { with: { user: true } } },
  });
  if (payment) {
    await db.delete(feePayments).where(eq(feePayments.id, id));
    await logActivity(
      session.user.id,
      "PAYMENT_DELETED",
      `${payment.receiptNo} (₹${Number(payment.amount)}, ${payment.student.user.name}) deleted`
    );
  }
  revalidatePath("/admin/fees");
  redirect("/admin/fees?deleted=1");
}

/** Structure fetch helper for the collect page */
export async function _structuresForClass(classId: string) {
  return db.query.feeStructures.findMany({
    where: eq(feeStructures.classId, classId),
    orderBy: (s, { asc }) => [asc(s.type)],
  });
}
void students;
