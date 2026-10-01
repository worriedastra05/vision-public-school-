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
  ClipboardCheck,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="animate-fade-up w-full max-w-md" style={{ animationDelay: "150ms" }}>
      {/* Glass card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="animate-glow-pulse flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-600/40">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Portal Login</h2>
            <p className="text-xs text-slate-400">Apna email aur password daal kar login karein</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-fade-up space-y-2" style={{ animationDelay: "250ms" }}>
            <Label htmlFor="email" className="text-slate-300">
              Email ya Admission Number
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="email"
                type="text"
                placeholder="email@school.edu  ya  VPS20260001"
                className="border-white/10 bg-white/[0.06] pl-10 text-white placeholder:text-slate-500 focus:border-brand-400 focus:ring-brand-400/25"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Students apna Admission Number (jaise VPS20260001) se bhi login kar sakte hain
            </p>
          </div>
          <div className="animate-fade-up space-y-2" style={{ animationDelay: "320ms" }}>
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="border-white/10 bg-white/[0.06] pl-10 text-white placeholder:text-slate-500 focus:border-brand-400 focus:ring-brand-400/25"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <p className="animate-shake rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300">
              {error}
            </p>
          )}

          <div className="animate-fade-up" style={{ animationDelay: "390ms" }}>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                "Login to Portal"
              )}
            </Button>
          </div>
        </form>

        {/* Dev demo credentials — PRODUCTION me hata dena */}
        <div className="animate-fade-up mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.04] p-3.5 text-xs leading-relaxed text-slate-400" style={{ animationDelay: "460ms" }}>
          <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> Demo logins (Phase 1 testing):
          </p>
          <p>👑 superadmin@visionpublicschool.edu / Super@123</p>
          <p>🛡️ admin@visionpublicschool.edu / Admin@123</p>
          <p>🎓 student@visionpublicschool.edu / Student@123</p>
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: ClipboardCheck, text: "Attendance & report cards — digital aur printable" },
  { icon: IdCard, text: "QR code ke saath smart student ID cards" },
  { icon: Wallet, text: "Fee tracking, receipts aur due reminders" },
];

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-midnight-950">
      {/* ── Animated background: floating orbs + mesh glow ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-brand-600/25 blur-[130px]" />
        <div className="animate-float-slow absolute -bottom-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[140px]" style={{ animationDelay: "1.5s" }} />
        <div className="animate-float absolute left-[45%] top-[30%] h-[300px] w-[300px] rounded-full bg-fuchsia-500/[0.13] blur-[110px]" style={{ animationDelay: "3s" }} />
        {/* subtle dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(rgba(165,180,252,0.4) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
      </div>

      {/* ── Left branding panel ── */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <div className="animate-fade-up flex items-center gap-3">
          <div className="glow-ring flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight">Vision Public School</p>
            <p className="text-xs font-medium text-brand-300/90">Education • Discipline • Excellence</p>
          </div>
        </div>

        <div className="space-y-7">
          <h1 className="animate-fade-up text-5xl font-bold leading-[1.12] tracking-tight" style={{ animationDelay: "120ms" }}>
            School Management
            <br />
            <span className="text-gradient">Made Simple.</span>
          </h1>
          <p className="animate-fade-up max-w-md text-[15px] leading-relaxed text-slate-400" style={{ animationDelay: "220ms" }}>
            Report cards, ID cards, attendance, fees — sab kuch ek secure premium portal par.
            Har role ko sirf wahi dikhta hai jo use dekhna chahiye.
          </p>
          <div className="space-y-3.5">
            {features.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className="animate-fade-up flex items-center gap-3.5 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 backdrop-blur transition-colors duration-300 hover:border-brand-500/30 hover:bg-white/[0.07]"
                style={{ animationDelay: `${320 + i * 110}ms` }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/25 to-violet-500/25 text-brand-300">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="animate-fade-in text-xs text-slate-500" style={{ animationDelay: "800ms" }}>
          © 2026 Vision Public School. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 lg:w-1/2">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
