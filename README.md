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
| 👑 Super Admin | `superadmin@visionpublicschool.edu` | `Super@123` |
| 🛡️ Admin | `admin@visionpublicschool.edu` | `Admin@123` |
| 🎓 Student | `student@visionpublicschool.edu` | `Student@123` |

## ✅ Phase 1 Complete — Foundation
- 🔐 Auth.js v5 login (bcrypt hashed passwords, JWT sessions)
- 🛡️ RBAC route guard (`proxy.ts`) — superadmin/admin/student sirf apne dashboards khol sakte hain
- 📊 Teeno role-specific dashboards (real database stats)
- 🗄️ 15-table PostgreSQL schema (users, students, classes, attendance, exams, marks, fees, notices, settings, activity logs...)
- 🌱 Seed script + demo data

## 🧱 Tech Stack
**Next.js 16** • TypeScript • Tailwind CSS v4 • **Drizzle ORM** • PostgreSQL (local: PGlite embedded • prod: Neon) • Auth.js v5

## 🌐 Production Deploy (Vercel + Supabase)
1. **Supabase:** [supabase.com](https://supabase.com) → New project → database password save karo
2. **Vercel:** [vercel.com](https://vercel.com) → GitHub se login → repo import → Deploy
3. **4 env vars** set karo (Vercel Dashboard → Project → Settings → Environment Variables), values `.env` file ke commented section me ready hain:
   - `DATABASE_URL` (Supabase **pooler**, port 6543)
   - `DIRECT_URL` (Supabase **pooler**, port 5432 — build-time migrations ke liye)
   - `AUTH_SECRET` (koi bhi 64-char random hex string)
   - `AUTH_TRUST_HOST` = `true`
4. Deploy → build khud `drizzle-kit migrate` chala ke tables bana dega (vercel.json me setup hai)
5. Deploy hone ke baad **ek baar** ye link kholo (demo users ban jayenge):
   `https://<aapki-app>.vercel.app/api/setup?secret=<AUTH_SECRET>`

👉 **Poori deep research & roadmap:** [SCHOOL-MANAGEMENT-GUIDE.md](./SCHOOL-MANAGEMENT-GUIDE.md)
