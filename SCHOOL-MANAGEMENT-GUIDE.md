# 🏫 Vision Public School — Complete School Management System
## Deep Research & Professional Build Guide (2026)

> Ye guide aapko A-Z batayegi: kya banana hai, kaise banana hai, kahan deploy karna hai (FREE me), database kahan se milega (FREE), aur Arena AI ke saath kaise step-by-step code karoge.

---

# ✅ CURRENT STATUS

| Phase | Status |
|---|---|
| **Phase 1 — Foundation** (Auth, RBAC, 3 dashboards, DB) | ✅ **COMPLETE** |
| Phase 2 — Layouts & dashboards polish | 🔜 Next |
| Phases 3–9 | Pending |

**Demo logins:** 👑 `superadmin@visionpublicschool.edu / Super@123` • 🛡️ `admin@visionpublicschool.edu / Admin@123` • 🎓 `student@visionpublicschool.edu / Student@123`

**Local me chalane ke liye:** `npm install` → `npm run db:generate && npm run db:migrate && npm run db:seed` → `npm run dev` (database setup ke liye KUCH install karne ki zaroorat nahi — embedded Postgres apne-aap chalta hai)

---

# 📌 PART 1: Sabse Bada Sawal — Ek App ya Alag-Alag Apps?

## Jawab: **EK HI app, alag-alag DASHBOARDS** ✅ (Yehi professional tareeka hai)

Aapko 3 alag websites/accounts **NAHI** banane. Pro tareeka ye hai:

```
                    ┌─────────────────────────────┐
                    │   visionschool.vercel.app   │
                    │      (EK HI WEBSITE)        │
                    └──────────────┬──────────────┘
                                   │
                          ┌────────▼────────┐
                          │  /login (EK hi  │
                          │   login page)   │
                          └────────┬────────┘
                                   │  Login ke baad system role check karta hai
              ┌────────────────────┼────────────────────┐
              │                    │                    │
    ┌─────────▼─────────┐ ┌────────▼────────┐ ┌─────────▼─────────┐
    │  /superadmin/...  │ │  /admin/...     │ │  /student/...     │
    │  SUPER ADMIN      │ │  ADMIN          │ │  STUDENT          │
    │  Dashboard        │ │  Dashboard      │ │  Dashboard        │
    └───────────────────┘ └─────────────────┘ └───────────────────┘
```

### Aise kaam karta hai:
1. **Ek hi login page** hota hai — sab (superadmin, admin, student) wahi se login karte hain.
2. Login hote hi system **role check** karta hai aur apne-apne dashboard par bhej deta hai:
   - Super Admin → `/superadmin/dashboard`
   - Admin → `/admin/dashboard`
   - Student → `/student/dashboard`
3. **Security guard (middleware)** har route par khada hai — student kabhi `/admin` page khol nahi sakta, admin `/superadmin` nahi khol sakta. URL type karke bhi nahi. Isko kehte hain **RBAC (Role-Based Access Control)**.

### Aisa kyun? (Simple bhasha me)
| Alag-alag apps ❌ | Ek app + role dashboards ✅ |
|---|---|
| 3 baar code likhna padega | Ek baar code, sab use karein |
| 3 jagah deploy (3x mehnat, 3x cost) | 1 deploy, 1 database |
| Data sync ka jhanjhat | Sab data ek hi database me, real-time |
| Update karna ho to 3 jagah karo | 1 jagah update = sabko update |

> Duniya ke saare professional school systems (aur bade software) aise hi bante hain — **role-based dashboards under one app**.

---

# 📌 PART 2: Roles & Power Hierarchy (Kaun Kya Dekh/Kar Sakta Hai)

```
        👑 SUPER ADMIN (Aap / School Owner)
        │  — Sab kuch: system settings, admins banana/hatana,
        │    pura data, backups, activity logs
        │
        ├── 🛡️ ADMIN (Principal / Office Staff)
        │     — Students add/edit, teachers manage, fees,
        │       attendance, results publish, ID cards, notices
        │     — ❌ System settings NAHI, ❌ admins manage NAHI
        │
        └── 🎓 STUDENT
              — Sirf APNA data: report card, ID card, attendance,
                fees status, timetable, notices
              — ❌ Kisi aur ka data NAHI, ❌ kuch edit NAHI
```

### Permission Matrix (Professional standard)

| Feature | 👑 Super Admin | 🛡️ Admin | 🎓 Student |
|---|---|---|---|
| Login | ✅ | ✅ | ✅ |
| Apna profile dekhna | ✅ | ✅ | ✅ |
| **Students add/edit/delete** | ✅ | ✅ | ❌ |
| **Teachers manage** | ✅ | ✅ | ❌ |
| **Admins create/manage** | ✅ | ❌ | ❌ |
| Attendance mark/dekhna | ✅ sabka | ✅ sabka | ✅ sirf apna |
| Result/Report card banana & publish | ✅ | ✅ | ❌ |
| Report card download | ✅ kisi ka bhi | ✅ kisi ka bhi | ✅ sirf apna |
| ID card generate | ✅ | ✅ | ✅ sirf apna |
| Fees manage & receipts | ✅ | ✅ | ✅ sirf apna status |
| Notices bhejna | ✅ | ✅ | ❌ (sirf padh sakta hai) |
| Classes/Subjects manage | ✅ | ✅ | ❌ |
| **System settings** (school info, session year, branding) | ✅ | ❌ | ❌ |
| **Activity/Audit logs** | ✅ | ❌ | ❌ |
| **Database backup** | ✅ | ❌ | ❌ |

> **Golden Rule of Security:** Server par HAMESHA dobara check karo. Sirf UI me button chhupana security nahi hai — backend/API ko bhi role verify karna chahiye. (Arena AI se code karwate waqt ye point zaroor bolna.)

---

# 📌 PART 3: Features List (Modules) — School Me Jo Jo Hota Hai

## 🎓 Student Module (Student kya karega)
- 📊 Personal dashboard (attendance %, latest result, pending fees — ek nazar me)
- 🪪 **Digital ID Card** — photo, name, class, roll no., QR code ke saath, download/print
- 📄 **Report Card** — term-wise marks, grades, rank, teacher remarks, PDF download/print
- 🗓️ Attendance history (calendar view)
- 💰 Fee status + receipts download
- 📚 Timetable / exam schedule
- 📢 Notices & announcements
- 👤 Profile (photo, address, parent info — view only)

## 🛡️ Admin Module (Office/Principal kya karega)
- 📊 Admin dashboard (total students, aaj ki attendance, fee collection stats, charts)
- 👨‍🎓 **Student Management** — admission form, edit, search, class/section assign, photo upload
- 👩‍🏫 **Teacher Management** — add teacher, subject/class assign
- 🏫 Classes & Sections manage (Class 1–12, sections A/B/C)
- 📖 Subjects manage
- ✅ **Attendance** — class-wise daily mark, monthly report
- 📝 **Exam & Result** — marks entry, auto grade calculation, report card generate, publish/draft control
- 🪪 **ID Card Generator** — single ya poore class ke ID cards bulk me, PDF print
- 💰 **Fees Management** — fee structure, invoices, payment record, receipts, due list
- 📢 Notice board — school-wide ya class-specific notices
- 📅 Timetable & exam datesheet banana
- 📥 Data export (Excel/PDF)

## 👑 Super Admin Module (Main Control — sirf aapke paas)
- Sab kuch jo Admin kar sakta hai, PLUS:
- 👥 **Admin accounts banana/edit karna/deactivate karna** (Admin khud admins nahi bana sakta)
- ⚙️ **System Settings** — school name, logo, address, academic session (2026-27), grade formula
- 🔐 Roles & permissions control
- 📜 **Activity Logs** — kisne kab kya kiya (audit trail)
- 💾 **Database Backup** / restore
- 🗑️ Danger zone — data delete/reset controls

## 🌟 Phase 2 me add kar sakte ho (baad me)
- 👨‍👩‍👧 Parent portal (apne bachche ka data)
- 📧 SMS/Email notifications (fee due, result published)
- 🚌 Transport management
- 📚 Library management
- 💬 Leave applications
- 📱 Mobile app (React Native)

---

# 📌 PART 4: Tech Stack (100% FREE Tier Friendly)

Ye stack main recommend karta hoon — modern, professional, aur **bilkul free** me chal jayega:

| Layer | Technology | Kyun? | Cost |
|---|---|---|---|
| **Framework** | **Next.js 16** (App Router + Turbopack) | Frontend + Backend dono ek me, fast | Free |
| **Language** | TypeScript | Professional, errors kam | Free |
| **Styling** | Tailwind CSS v4 (shadcn-style components) | Sundar modern UI | Free |
| **Database** | **PostgreSQL** | Relational data (students↔classes↔marks) ke liye best | Free |
| **DB — Local dev** | **PGlite** (embedded Postgres) | Zero setup — koi server install nahi, data folder me persist | Free |
| **DB — Production** | **Neon** ya **Supabase** | Free PostgreSQL hosting (details Part 6 me) | ₹0 |
| **ORM** | **Drizzle ORM** ⭐ | 100% pure TypeScript — kabhi native binaries download nahi karta, Neon ke saath first-class support, SQL-jaisa clean API | Free |
| **Auth** | Auth.js v5 (NextAuth) | Login + role-based JWT sessions, industry standard | Free |
| **Route guard** | `proxy.ts` (Next 16) | Role-based route protection ek jagah | Free |
| **PDF (ID/Report card)** | jsPDF / @react-pdf/renderer | ID card & report card download | Free |
| **QR Code** | qrcode / react-qr-code | ID card par QR | Free |
| **Charts** | Recharts | Dashboard graphs | Free |
| **Deploy** | **Vercel** (Hobby) | Next.js ke makers ka platform, 1-click deploy | ₹0 |
| **Code storage** | GitHub | Aapka repo already yahan hai | Free |

> 📝 **Note:** Shuruaat me guide Prisma suggest karti thi, par development environment me Prisma ki native engine binaries download nahi ho pa rahi thi — isliye **Drizzle ORM** chuna gaya. Ye actually better hai hamare liye: pure TypeScript, offline-friendly, aur Vercel par bina kisi config ke chalta hai. Production deploy ke liye user ko sirf `DATABASE_URL` (Neon) set karni hai — code change zero.

### Alternative (agar simple chahiye):
Supabase use karo to **Auth + Database + File Storage (photos)** teeno ek hi free account me mil jate hain — setup aur bhi aasan.

---

# 📌 PART 5: Database Design (Tables) — Ye Dil Hai System Ka

PostgreSQL me ye tables banenge (Prisma schema me convert honge):

```
users              → sab logins yahan (role column: SUPERADMIN | ADMIN | STUDENT)
├── id, name, email, password (hashed), role, status, createdAt

students           → student ki details
├── id, userId (FK), admissionNo, classId, sectionId, rollNo,
│   dob, gender, bloodGroup, photo, address, fatherName, motherName,
│   parentPhone, admissionDate

teachers           → teachers ki details
├── id, userId (FK), employeeId, subject, qualification, phone, photo

classes            → Class 1..12
sections           → A, B, C (classId ke saath linked)
subjects           → Maths, Science... (classId ke saath linked)

attendance         → roz ki hazri
├── id, studentId, classId, date, status (PRESENT/ABSENT/LEAVE), markedBy

exams              → Half-Yearly, Annual, Unit Test...
├── id, name, termId, classId, startDate, endDate

marks              → exam ke numbers
├── id, examId, studentId, subjectId, marksObtained, maxMarks, grade

fee_structures     → class-wise fee kitni hai
├── id, classId, type (Tuition/Transport/Exam), amount, frequency

fee_payments       → jama hui fees
├── id, studentId, amount, date, receiptNo, mode (Cash/UPI), receivedBy

notices            → announcements
├── id, title, body, targetRole/targetClass, createdBy, createdAt

sessions           → academic years (2025-26, 2026-27)
settings           → school name, logo, address, grade formula (sirf superadmin edit kare)

activity_logs      → kisne kya kiya (superadmin ke liye)
├── id, userId, action, details, timestamp
```

**Relations:** `students.classId → classes.id`, `marks.studentId → students.id`... aishe saare tables aapas me linked rahenge, isliye data kabhi duplicate/galat nahi hoga.

---

# 📌 PART 6: FREE Database Kahan Se Milega (Aapka Sawal ✅)

Dono options **bilkul free, no credit card**:

## Option A: **Neon** ⭐ (Main recommend — best free Postgres)
| Kya milta hai FREE me | Limit |
|---|---|
| Storage | 0.5 GB per project (ek school ke liye kaafi — hazaron students ka text data aa jayega) |
| Projects | 100 tak! |
| Compute | 100 hours/month, idle hone par auto-sleep (paisa nahi lagta) |
| Card chahiye? | ❌ Nahi |
| Expire hota hai? | ❌ Nahi, permanent free tier |
| Signup | https://neon.tech → GitHub se login → project banao → connection string copy |

## Option B: **Supabase** ⭐ (Agar auth + photo storage bhi free me saath chahiye)
| Kya milta hai FREE me | Limit |
|---|---|
| Postgres database | 500 MB |
| **Auth (login system) FREE** | 50,000 monthly users |
| **File storage** (student photos, documents) | 1 GB |
| Dhyan rakhen | 1 hafte inactivity par pause ho jata hai (dashboard se 1-click restore) |
| Signup | https://supabase.com → GitHub se login → New project |

> 💡 **Meri salah:** Shuruaat me **Neon + Auth.js** simple rahega. Photos ke liye free **Cloudinary** (25 GB free) ya Supabase storage alag se jod sakte ho. Ya poora ecosystem ek jagah chahiye to **Supabase** lo.

## Photos/files ke liye (student photo ID card me chahiye hogi):
- **Cloudinary** — 25 GB storage + 25 GB bandwidth FREE → https://cloudinary.com
- Ya Supabase Storage (1 GB free) — agar Supabase use kar rahe ho

---

# 📌 PART 7: FREE Deployment — Kahan Deploy Kare (Aapka Sawal ✅)

## **Vercel Hobby Plan** ⭐ — 100% FREE, Next.js ka ghar

| Kya milta hai | Limit (free) |
|---|---|
| Bandwidth | 100 GB/month (ek school ke liye bahut hai) |
| SSL (https 🔒) | Free, automatic |
| Custom domain | Free (baad me .com/.in laga sakte ho) |
| Auto-deploy | GitHub push karte hi website update |
| Cost | ₹0 forever, no credit card |

### Deploy ka process (5 minute):
1. Code GitHub par push karo (aapka repo ready hai ✅)
2. https://vercel.com → **Sign up with GitHub**
3. **"Add New Project"** → apna repo `vision-public-school-` select karo
4. **Environment Variables** add karo (database URL, auth secret — ye next section me)
5. **Deploy** dabao → 2 minute me live: `vision-public-school.vercel.app` 🎉

### Kab paid lagega?
School scale par **kabhi nahi** — 100GB bandwidth school traffic se kahin zyada hai. Baad me chaaho to:
- Custom domain (~₹700-900/saal, `.in` domain — optional)
- Bas yahi ek optional kharcha hai, baaki sab free.

> ⚠️ Render/Railway maine research kiye — Railway ka ab real free tier nahi hai (sirf $5 trial), Render ka free tier sleep ho jata hai. **Next.js ke liye Vercel + Neon sabse solid FREE combo hai (2026 me).**

---

# 📌 PART 8: Security Checklist (Professional Banane Ke Liye Zaroori)

- ✅ Passwords **bcrypt hash** — kabhi plain text me nahi
- ✅ **Middleware protection** — `/admin/*`, `/superadmin/*`, `/student/*` routes locked
- ✅ **Har API route par role verify** — sirf frontend me button chhupana enough nahi
- ✅ Student sirf **apna** data fetch kar sakta hai (query me `studentId = loggedInUser` force karo)
- ✅ HTTPS (Vercel free deta hai)
- ✅ Environment variables me secrets (`.env` kabhi GitHub par push mat karo — `.gitignore` me rahe)
- ✅ Login attempts limit (brute force se bachne ke liye — baad me add karna)
- ✅ Activity logs (superadmin dekhe kisne kya kiya)

---

# 📌 PART 9: Arena AI Ke Saath Kaise Banayenge — Step-by-Step Process

Ye **roadmap** hai. Har step me mujhe (Arena AI) ek prompt do, main code kar dunga. Order follow karna — har step pehle wale par depend karta hai.

### 🟢 PHASE 1: Foundation (Sabse pehle)
```
Prompt 1: "Next.js 15 + TypeScript + Tailwind + shadcn/ui ka project setup karo,
Prisma + PostgreSQL (Neon) connect karo, aur Auth.js se login system banao
jisme teen roles hon: SUPERADMIN, ADMIN, STUDENT. Middleware se /superadmin,
/admin, /student routes protect karo — role ke hisaab se redirect ho."
```
- Iske baad aap Neon par free database banaoge, `.env` me URL daloge
- Prisma migration chalegi, tables ban jayengi
- Ek seed script se pehla superadmin account banega (aapka login)

### 🟢 PHASE 2: Layouts & Dashboards
```
Prompt 2: "Teeno roles ke liye alag dashboard layouts banao — sidebar navigation
ke saath. Superadmin sidebar me: Dashboard, Admins, Students, Teachers, Classes,
Exams, Fees, Notices, Settings, Activity Logs, Backup. Admin sidebar me wahi sab
minus Settings/Logs/Admins. Student sidebar me: Dashboard, My ID Card, Report Card,
Attendance, Fees, Timetable, Notices, Profile."
```

### 🟢 PHASE 3: Core Modules (Ek ek karke)
```
Prompt 3: "Classes, Sections aur Subjects ka CRUD banao (admin manage kare)"
Prompt 4: "Student admission form + student list (search/filter/pagination) banao,
photo upload ke saath"
Prompt 5: "Teacher management CRUD banao"
Prompt 6: "Class-wise daily attendance marking + monthly attendance report banao"
```

### 🟢 PHASE 4: Exams & Report Cards ⭐ (Sabse important module)
```
Prompt 7: "Exam creation + subject-wise marks entry banao. Auto grade calculate ho.
Report card generate ho — school header, student photo, subject-wise marks,
total, percentage, grade, rank, remarks ke saath. PDF download/print button ho.
Student apna report card tabhi dekhe jab admin 'publish' kare."
```

### 🟢 PHASE 5: ID Cards 🪪
```
Prompt 8: "Digital ID card generator banao — front design: school logo, student
photo, naam, class-section, roll no, DOB, blood group, address, QR code
(student verification link ka). PDF download + bulk print poore class ka."
```

### 🟢 PHASE 6: Fees 💰
```
Prompt 9: "Fee structure setup (class-wise), fee payment entry, receipt PDF
generate, due fees list, aur student portal me fee status + receipts download banao"
```

### 🟢 PHASE 7: Notices, Timetable, Polish
```
Prompt 10: "Notice board banao — admin post kare, target (all/class-wise) select
kar sake. Student dashboard par notices dikhen."
Prompt 11: "Dashboards par charts/stats add karo (Recharts) — attendance %,
fee collection, student count etc."
```

### 🟢 PHASE 8: Superadmin Powers + Security
```
Prompt 12: "Superadmin ke liye: admin accounts manage (create/edit/deactivate),
system settings (school name/logo/session), activity logs page, aur har API
route par server-side role verification audit karo"
```

### 🟢 PHASE 9: Deploy 🚀
```
Prompt 13: "Production build check karo, seed script banao, aur mujhe Vercel
deploy ke steps batao"
```
Phir Part 7 ke steps follow karo → **LIVE** 🎉

> 💡 **Pro tip:** Har phase ke baad bolna "test karke errors fix karo" — main build run karke errors theek kar dunga. Aur har baar bolo ki "server par role check zaroor rakhna".

---

# 📌 PART 10: Total Cost Summary 💸

| Cheez | Kahan se | Cost |
|---|---|---|
| Code development | Arena AI | ✅ Free (aap yahin ho) |
| Code hosting | GitHub | ✅ Free |
| Website hosting + SSL | Vercel Hobby | ✅ Free |
| PostgreSQL database | Neon / Supabase | ✅ Free |
| Photos storage | Cloudinary / Supabase | ✅ Free |
| **TOTAL** | | **₹0/month** 🎉 |
| (Optional) Domain `.in` | GoDaddy/Hostinger | ~₹500–900/**saal** |

---

# 📌 Quick Answers Recap (Aapke Saare Sawal)

| Aapka Sawal | Jawab |
|---|---|
| Superadmin/Admin/Student ke pages **ek ya alag?** | **Ek hi app, ek hi login** — role ke hisaab se alag dashboard (`/superadmin`, `/admin`, `/student`). Alag apps kabhi mat banana. |
| Sabko sirf wahi dikhe jo dekhna chahiye? | **RBAC + Middleware + API-level role checks** se hoga |
| Kahan deploy kare? | **Vercel** (free, Next.js ke liye best) |
| Free database kahan se? | **Neon** (0.5 GB free, no card) ya **Supabase** (DB+auth+storage free) |
| Main control kiske paas? | **Superadmin** — admins manage, settings, logs, backup sab uske paas |
| Sequencing kaise? | Part 9 ka roadmap follow karo — Phase 1 se shuru |

---

## 🚀 Ab Aage Kya?

Bas bolo: **"Phase 1 start karo"** — main poora project setup, database schema, auth system, aur role-based routing bana deta hoon. Uske baad hum phase by phase poora professional school management system bana lenge! 💪
