"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  IdCard,
  Wallet,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      identifier: email.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      // MissingCSRF = browser ne cookie block ki (iframe/desktop-mode me hota hai)
      setError(
        String(res.error).includes("MissingCSRF")
          ? "Browser ne cookies block kar di hain — preview ko naye tab me khol kar try karein."
          : "Email ya password galat hai. Dobara try karein."
      );
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/");
    router.refresh();
  }

  return (
    <div className="animate-fade-up w-full max-w-md" style={{ animationDelay: "120ms" }}>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_20px_50px_-20px_rgba(19,31,54,0.15)] dark:border-white/10 dark:bg-ink-900">
        <div className="mb-7">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-ink-950 lg:hidden">
            <GraduationCap className="h-5 w-5 text-gold-400" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Portal Login
          </h2>
          <div className="gold-rule mt-3 w-16" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Apna email aur password daal kar login karein
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email ya Admission Number</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="text"
                placeholder="email@school.edu  ya  VPS20260001"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Students apna Admission Number (jaise VPS20260001) se bhi login kar sakte hain
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <p className="animate-shake rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" variant="gold" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login to Portal"
            )}
          </Button>
        </form>

        {/* Dev demo credentials — PRODUCTION me hata dena */}
        <div className="mt-7 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          <p className="mb-2 flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-600" /> Demo logins:
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <p><span className="text-gold-700 dark:text-gold-400">SUPER</span> superadmin@visionpublicschool.edu / Super@123</p>
            <p><span className="text-brand-700 dark:text-brand-300">ADMIN</span> admin@visionpublicschool.edu / Admin@123</p>
            <p><span className="text-emerald-700 dark:text-emerald-400">STUDENT</span> student@visionpublicschool.edu / Student@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: FileText, text: "Report cards — digital, printable, ek click publish" },
  { icon: IdCard, text: "QR code ke saath smart student ID cards" },
  { icon: Wallet, text: "Fee tracking, receipts aur dues — sab transparent" },
];

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen bg-paper dark:bg-ink-950">
      <div className="absolute right-4 top-4 z-20 lg:right-6 lg:top-6">
        <ThemeToggle />
      </div>

      {/* ── Left panel — academic navy, serif branding ── */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white lg:flex">
        {/* subtle damask texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5l7 12-7 12-7-12zM30 31l7 12-7 12-7-12z' fill='none' stroke='%23ddbd68' stroke-width='0.8'/%3E%3C/svg%3E\")",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10">
          <div className="animate-fade-up flex items-center gap-4">
            <div className="glow-ring flex h-13 w-13 items-center justify-center rounded-full border border-gold-500/40 bg-ink-900">
              <GraduationCap className="h-6.5 w-6.5 text-gold-400" />
            </div>
            <div>
              <p className="font-display text-xl font-bold leading-tight tracking-tight">
                Vision Public School
              </p>
              <p className="font-display text-xs italic text-gold-400/90">
                Education • Discipline • Excellence
              </p>
            </div>
          </div>
          <div className="gold-rule mt-8 w-24" />
        </div>

        <div className="relative z-10 space-y-7">
          <h1 className="animate-fade-up font-display text-[42px] font-bold leading-[1.15] tracking-tight" style={{ animationDelay: "110ms" }}>
            Shiksha ka
            <br />
            digital <span className="text-gradient italic">shatabdi.</span>
          </h1>
          <p className="animate-fade-up max-w-md font-display text-[15px] italic leading-relaxed text-slate-300/90" style={{ animationDelay: "200ms" }}>
            "Padhai, parampara aur pragati — ab ek portal me."
          </p>
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className="animate-fade-up flex items-center gap-3.5 border-l-[3px] border-gold-500/50 py-1 pl-4"
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <Icon className="h-4 w-4 shrink-0 text-gold-400" />
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <p className="text-[11px] tracking-wide text-slate-500">
            © 2026 Vision Public School
          </p>
          <p className="font-display text-[11px] italic text-gold-500/80">Est. Excellence</p>
        </div>
      </div>

      {/* ── Right form panel — ivory ── */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 lg:w-[54%]">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
