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

## 🌐 Production Deploy
1. [Neon](https://neon.tech) par free database banao, connection string copy karo
2. [Vercel](https://vercel.com) par repo import karo
3. Env vars set karo: `DATABASE_URL` (Neon ka), `AUTH_SECRET`, `AUTH_TRUST_HOST=true`
4. Deploy → phir `npm run db:migrate && npm run db:seed` Neon URL ke saath ek baar chalao

👉 **Poori deep research & roadmap:** [SCHOOL-MANAGEMENT-GUIDE.md](./SCHOOL-MANAGEMENT-GUIDE.md)
