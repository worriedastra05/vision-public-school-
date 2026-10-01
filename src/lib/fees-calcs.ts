/** Fees ke shared helpers — pure functions, server+client safe */

export interface FeeItem {
  label: string;
  amount: number;
}

/** remarks field me itemized JSON (ek receipt = multiple fee types) */
export function packRemarks(items: FeeItem[], note: string): string {
  return JSON.stringify({ items, note });
}
export function parseRemarks(raw: string | null): { items: FeeItem[]; note: string } {
  if (!raw) return { items: [], note: "" };
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p.items)) return { items: p.items, note: p.note ?? "" };
  } catch {
    // purana plain-text remark
  }
  return { items: [], note: raw };
}

/** Session ke hisaab se expected fees.
 *  ONE_TIME → amount x1 | TERM → amount x1 per session (approx) | MONTHLY → amount x months so far
 *  months: session start (ya admission date, jo baad me ho) se ab tak, session end tak capped. */
export function expectedForSession(
  structures: { type: string; amount: string; frequency: string }[],
  sessionStart: Date | null,
  admissionDate: Date | null,
  now = new Date()
): number {
  const start = new Date(
    Math.max(sessionStart?.getTime() ?? 0, admissionDate?.getTime() ?? 0)
  );
  const months =
    Math.max(0, now.getFullYear() * 12 + now.getMonth() - (start.getFullYear() * 12 + start.getMonth())) + 1;

  return structures.reduce((sum, s) => {
    const amt = Number(s.amount) || 0;
    if (s.frequency === "MONTHLY") return sum + amt * months;
    return sum + amt; // TERM / ONE_TIME — session me ek baar
  }, 0);
}

// ── Amount in words (Indian system: thousand, lakh) ─────────────────
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigit(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}
function threeDigit(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? twoDigit(r) : "");
}

export function amountInWords(amount: number): string {
  const n = Math.round(amount);
  if (n === 0) return "Zero Rupees Only";
  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];
  if (crore) parts.push(threeDigit(crore) + " Crore");
  if (lakh) parts.push(twoDigit(lakh) + " Lakh");
  if (thousand) parts.push(twoDigit(thousand) + " Thousand");
  if (rest) parts.push(threeDigit(rest));
  return parts.join(" ") + " Rupees Only";
}

/** ₹1,700.00 → "₹1,700" formatting */
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
