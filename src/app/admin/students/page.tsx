import Link from "next/link";
import { and, or, eq, ilike, count, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes, sections, students, users } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Plus,
  Search,
  UserRound,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 10;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string; page?: string; err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { q, classId, page, err } = await searchParams;

  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const query = q?.trim();

  const where = and(
    query ? or(ilike(users.name, `%${query}%`), ilike(students.admissionNo, `%${query}%`)) : undefined,
    classId ? eq(students.classId, classId) : undefined
  );

  const [rows, [{ total }], classRows] = await Promise.all([
    db
      .select({
        id: students.id,
        admissionNo: students.admissionNo,
        rollNo: students.rollNo,
        photo: students.photo,
        parentPhone: students.parentPhone,
        name: users.name,
        isActive: users.isActive,
        className: classes.name,
        sectionName: sections.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(classes, eq(students.classId, classes.id))
      .leftJoin(sections, eq(students.sectionId, sections.id))
      .where(where)
      .orderBy(desc(students.admissionDate))
      .limit(PAGE_SIZE)
      .offset((pageNum - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(where),
    db.query.classes.findMany({ orderBy: (c, { asc }) => [asc(c.name)] }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageLink = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (classId) params.set("classId", classId);
    params.set("page", String(p));
    return `/admin/students?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Students</h2>
            <p className="text-sm text-slate-500">{total} students found</p>
          </div>
          <Link href="/admin/students/new">
            <Button>
              <Plus className="h-4 w-4" /> New Admission
            </Button>
          </Link>
        </div>
      </Reveal>

      {err && (
        <Reveal>
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <XCircle className="h-4.5 w-4.5" /> {err}
          </div>
        </Reveal>
      )}

      {/* Filters */}
      <Reveal delay={80}>
        <form method="get" className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Naam ya Admission No. se search..."
              className="pl-10"
            />
          </div>
          <Select name="classId" defaultValue={classId ?? ""} className="w-44">
            <option value="">All Classes</option>
            {classRows.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" /> Filter
          </Button>
          {(query || classId) && (
            <Link href="/admin/students">
              <Button type="button" variant="ghost">
                Clear
              </Button>
            </Link>
          )}
        </form>
      </Reveal>

      {/* Table */}
      <Reveal delay={140}>
        <Card className="card-hover overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-5 py-3.5 font-semibold">Admission No.</th>
                  <th className="px-5 py-3.5 font-semibold">Class</th>
                  <th className="px-5 py-3.5 font-semibold">Parent Phone</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-brand-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {row.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.photo}
                            alt={row.name}
                            className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white">
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-slate-800">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{row.admissionNo}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {row.className}
                      {row.sectionName ? ` • ${row.sectionName}` : ""}
                      {row.rollNo ? ` • Roll ${row.rollNo}` : ""}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{row.parentPhone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={row.isActive ? "success" : "danger"} className="border-0">
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/students/${row.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="p-12 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                {query ? `"${query}" ke liye koi student nahi mila` : "Abhi koi student nahi — pehla admission karein!"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-5 py-3">
              <p className="text-xs text-slate-500">
                Page <span className="font-semibold text-slate-700">{pageNum}</span> of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {pageNum > 1 && (
                  <Link href={pageLink(pageNum - 1)}>
                    <Button size="sm" variant="outline">
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>
                  </Link>
                )}
                {pageNum < totalPages && (
                  <Link href={pageLink(pageNum + 1)}>
                    <Button size="sm" variant="outline">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </Card>
      </Reveal>

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <UserRound className="h-3.5 w-3.5" /> Har admission ke saath student ka login automatic ban jata hai
      </p>
    </div>
  );
}
