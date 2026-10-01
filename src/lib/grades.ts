/** Percentage se grade (CBSE-ish 8-grade scale) */
export function gradeFor(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  if (pct >= 33) return "E";
  return "F";
}

export function gradeColor(grade: string | null | undefined): string {
  switch (grade) {
    case "A+":
    case "A":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "B":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "C":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "D":
    case "E":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-rose-100 text-rose-700 border-rose-200";
  }
}

export function isPass(pct: number): boolean {
  return pct >= 33;
}
