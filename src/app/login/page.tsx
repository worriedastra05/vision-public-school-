"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Loader2, Lock, Mail, IdCard, ClipboardCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ya password galat hai. Dobara try karein.");
      return;
    }

    // Root page role ke hisaab se dashboard par redirect karega
    router.push(searchParams.get("callbackUrl") || "/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-xl">
      <CardHeader className="space-y-1">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 md:hidden">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <CardTitle className="text-2xl">Portal Login</CardTitle>
        <CardDescription>Apna email aur password daal kar login karein</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@visionpublicschool.edu"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Dev demo credentials — PRODUCTION me hata dena */}
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-1 font-semibold text-slate-600">Demo logins (Phase 1 testing):</p>
          <p>👑 superadmin@visionpublicschool.edu / Super@123</p>
          <p>🛡️ admin@visionpublicschool.edu / Admin@123</p>
          <p>🎓 student@visionpublicschool.edu / Student@123</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 p-12 text-white md:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Vision Public School</p>
            <p className="text-xs text-indigo-200">Education • Discipline • Excellence</p>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            School Management
            <br />
            <span className="text-indigo-300">Made Simple.</span>
          </h1>
          <p className="max-w-md text-indigo-100">
            Report cards, ID cards, attendance, fees — sab kuch ek secure portal par.
            Har role ko sirf wahi dikhta hai jo use dekhna chahiye.
          </p>
          <div className="space-y-3 text-sm">
            {[
              { icon: ClipboardCheck, text: "Attendance & report cards — digital aur printable" },
              { icon: IdCard, text: "QR code ke saath smart student ID cards" },
              { icon: Wallet, text: "Fee tracking, receipts aur due reminders" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-indigo-100">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-indigo-300">© 2026 Vision Public School. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center p-6 md:w-1/2">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
