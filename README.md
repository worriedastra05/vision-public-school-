# 🏫 Vision Public School — School Management System

Ek professional, role-based school management system jisme **Super Admin**, **Admin** aur **Student** — teeno apna data securely dekh sakte hain.

## 🚀 Quick Start

```bash
npm install                                   # dependencies
npm run db:generate && npm run db:migrate     # database tables banao (embedded Postgres — koi setup nahi!)
npm run db:seed                               # demo users + data
npm run dev                                   # http://localhost:3000
```

### 🔑 Demo Logins
| Role | Email | Password |
|---|---|---|
| 👑 Super Admin | `superadmin@visionpublicschool.com` | `Super@123` |
| 🛡️ Admin | `admin@visionpublicschool.com` | `Admin@123` |
| 🎓 Student | `VPS20260001` (admission no.) or `student@visionpublicschool.com` | `Student@123` |

## ✅ Phase 1 Complete — Foundation
- 🔐 Auth.js v5 login (bcrypt hashed passwords, JWT sessions)
- 🛡️ RBAC route guard (`proxy.ts`) — superadmin/admin/student sirf apne dashboards khol sakte hain
- 📊 Teeno role-specific dashboards (real database stats)
- 🗄️ 15-table PostgreSQL schema (users, students, classes, attendance, exams, marks, fees, notices, settings, activity logs...)
- 🌱 Seed script + demo data

## 🧱 Tech Stack
**Next.js 16** • TypeScript • Tailwind CSS v4 • **Drizzle ORM** • PostgreSQL (local: PGlite embedded • prod: Neon) • Auth.js v5

## 🌐 Production Deploy (Vercel + Supabase) — 5 minutes
1. **Supabase:** [supabase.com](https://supabase.com) → New project → database password save karo (free tier kaafi hai)
2. **Vercel:** [vercel.com](https://vercel.com) → GitHub se login → ye repo import → Deploy
3. **3 env vars** set karo (Vercel Dashboard → Project → Settings → Environment Variables → har key: **Production + Preview dono** tick):
   - `DATABASE_URL` — Supabase **Transaction pooler** URL (port **6543**). Shape: `.env.example` me ready-made hai
   - `AUTH_SECRET` — 64-char random hex (`.env.example` me ek generated hai)
   - `AUTH_TRUST_HOST` — `true` **(bina iske login kaam nahi karega)**
4. Deploy hone ke baad **ek baar** ye link kholo (tables + demo users ban jayenge):
   `https://<aapki-app>.vercel.app/api/setup?secret=<AUTH_SECRET>`
   → `{"ok": true, ...}` aaya to bas! Login: `superadmin@visionpublicschool.com / Super@123`

🛡️ Setup idempotent hai — galti se dobara kholo to kuch duplicate nahi hoga. Tables runtime migrations se banti hain (`drizzle/*.sql`), koi build-step/database-dashboard work NAHI chahiye.

👉 **Poori deep research & roadmap:** [SCHOOL-MANAGEMENT-GUIDE.md](./SCHOOL-MANAGEMENT-GUIDE.md)
