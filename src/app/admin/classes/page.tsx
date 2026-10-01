import { db } from "@/lib/db";
import {
  createClass,
  addSection,
  addSubject,
  deleteClass,
  deleteSection,
  deleteSubject,
} from "@/lib/actions/classes";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import { BookOpen, Plus, Trash2, Users, Layers, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { ok, err } = await searchParams;

  const classRows = await db.query.classes.findMany({
    with: {
      sections: true,
      subjects: true,
      students: { columns: { id: true } },
    },
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Classes & Subjects</h2>
            <p className="text-sm text-slate-500">
              {classRows.length} classes • manage sections and subjects here
            </p>
          </div>
          {/* Add class inline form */}
          <form action={createClass} className="flex items-center gap-2">
            <Input name="name" placeholder='e.g. "Class 2"' className="w-40" required />
            <Button type="submit">
              <Plus className="h-4 w-4" /> Add Class
            </Button>
          </form>
        </div>
      </Reveal>

      {(ok || err) && (
        <Reveal>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
              ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {ok ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
            {ok ?? err}
          </div>
        </Reveal>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {classRows.map((cls, i) => (
          <Reveal key={cls.id} delay={90 + i * 80}>
            <Card className="card-hover h-full">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{cls.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {cls.students.length} students
                    </CardDescription>
                  </div>
                </div>
                <form action={deleteClass}>
                  <input type="hidden" name="classId" value={cls.id} />
                  <ConfirmSubmit
                    message={`Delete "${cls.name}"? Its sections and subjects will also be deleted.`}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmit>
                </form>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sections */}
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Layers className="h-3.5 w-3.5" /> Sections
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {cls.sections.map((sec) => (
                      <span
                        key={sec.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-xs font-semibold text-brand-700"
                      >
                        {sec.name}
                        <form action={deleteSection} className="inline">
                          <input type="hidden" name="id" value={sec.id} />
                          <ConfirmSubmit
                            message={`Delete section ${sec.name}?`}
                            className="rounded-full p-0.5 text-brand-400 hover:bg-brand-100 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </ConfirmSubmit>
                        </form>
                      </span>
                    ))}
                    <form action={addSection} className="flex items-center gap-1.5">
                      <input type="hidden" name="classId" value={cls.id} />
                      <Input name="name" placeholder="A" className="h-8 w-14 text-xs" required maxLength={3} />
                      <Button type="submit" size="sm" variant="outline" className="h-8">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Subjects
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {cls.subjects.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-xs font-medium text-slate-600"
                      >
                        {sub.name}
                        <form action={deleteSubject} className="inline">
                          <input type="hidden" name="id" value={sub.id} />
                          <ConfirmSubmit
                            message={`Delete the subject "${sub.name}"?`}
                            className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </ConfirmSubmit>
                        </form>
                      </span>
                    ))}
                    <form action={addSubject} className="flex items-center gap-1.5">
                      <input type="hidden" name="classId" value={cls.id} />
                      <Input name="name" placeholder="Subject name" className="h-8 w-32 text-xs" required />
                      <Button type="submit" size="sm" variant="outline" className="h-8">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      {classRows.length === 0 && (
        <Reveal delay={120}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No classes yet — add your first class above (e.g. &quot;Class 1&quot;)
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
