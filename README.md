# UDPAD — Unified Digital Platform for Accessible Public Documentation

> **Demonstration Portal — Sample Data**  
> An interactive citizen-facing frontend prototype showcasing modern digital public infrastructure for transparent household records, welfare discovery and non-punitive deduplication verification.

---

## 1. Project Overview

**UDPAD (Unified Digital Platform for Accessible Public Documentation)** addresses a critical challenge in citizen welfare administration: **preventing duplicate welfare claims across connected entities without automatically rejecting legitimate applicants or depriving honest families of their constitutional rights.**

### Core Innovation Principles
1. **Benefit Unit Distinction:** Clearly separates **Individual-level benefits** (e.g., student merit scholarships, old-age pensions) from **Household-level benefits** (e.g., sanitation grants, clean cooking gas) and **Dwelling/Facility-level benefits** (e.g., rooftop solar installations). A student's scholarship is never blocked because their family ancestral home received a latrine subsidy.
2. **Non-Punitive Verification Alerts:** A potential duplicate match triggers a neutral **verification review notice**, never an automatic or algorithmic rejection.
3. **Transparent Human Review:** Cases flagged for potential overlap are queued for human review by authorized zonal officers.
4. **Clarification and Appeal Rights:** Citizens can easily submit proof of nuclear household separation, rental tenancy, or separate electricity utility connections to establish distinct residency.
5. **Auditable Chronological Timelines:** Every step, handling authority and document request is visible to the citizen.

---

## 2. Technology Stack

### Frontend
- **React 19** with **Vite 8**
- **JavaScript (JSX)**
- **React Router DOM v7** (Nested routing, protected citizen services and public pages)
- **Tailwind CSS v4** (`@tailwindcss/vite` with custom government design tokens)
- **Lucide React** (Official-style iconography)
- **React Hook Form** (Accessible client-side validation)

### Backend & Database
- **Node.js** with **Express.js 5** (High-performance REST API on port 5001)
- **CORS & Environment Management** (`cors`, `dotenv`)
- **PostgreSQL / Supabase** (`@supabase/supabase-js`, `pg`)
- **High-Speed In-Memory & Local Fallback** (Instant zero-config local operation)
- **Complete SQL Schema** (`supabase-schema.sql` with all 11 tables, indexes, RLS policies and 25 seeded schemes)

---

## 3. Getting Started

### Prerequisites
- Node.js (v18 or higher; tested on v24)
- npm (v9 or higher)

### Installation
```bash
# Clone or navigate to the repository directory
cd /path/to/UDPAD

# Install dependencies
npm install

# Start both Express backend (port 5001) and Vite frontend (port 5173) concurrently:
npm run dev:all

# Or run them in separate terminals:
# Terminal 1: npm run server
# Terminal 2: npm run dev
```

- Frontend: `http://localhost:5173/`
- Backend API & Health: `http://localhost:5001/api/health`

---

## 4. Supabase PostgreSQL Database Setup (Connect Anytime)

The platform is designed to run seamlessly right now out-of-the-box. When you are ready to connect your live Supabase PostgreSQL database:

1. **Create a Supabase Project:**
   - Log into [Supabase Dashboard](https://supabase.com/dashboard) and click **"New Project"**.
2. **Execute Database Schema:**
   - Go to the **"SQL Editor"** tab in your Supabase dashboard.
   - Open [`supabase-schema.sql`](file:///Users/sachinkumarchauhan/Downloads/HAckathon/supabase-schema.sql) from this repository, paste its entire content into the SQL editor and click **"Run"**.
   - This automatically creates all 11 relational tables, sets up Row-Level Security (RLS) policies and seeds all 25 government welfare schemes.
3. **Configure Environment Variables:**
   - In Supabase, navigate to **Project Settings** > **API**.
   - Copy your **Project URL** and **Project API Key (anon/public)**.
   - Paste them into your [`.env`](file:///Users/sachinkumarchauhan/Downloads/HAckathon/.env) file:
     ```env
     PORT=5001
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_ANON_KEY=your-anon-key-here
     ```
4. **Restart Backend Server:**
   - The Express backend detects your Supabase credentials automatically and switches to live PostgreSQL queries!

---

## 5. Citizen Registration & Access

The platform starts completely clean without hardcoded pre-existing records:

1. **New Citizen Registration:** Navigate to `/register` or click **"Register as Citizen"**.
2. **Account Creation:** Enter your name, 10-digit mobile number, email (optional) and password.
3. **Instant Access:** Registering creates your citizen profile, establishes your primary household unit and directs you to `/dashboard`.
4. **Sign In:** Any citizen account registered in your session can sign in via `/login` using their mobile number or email and password.

---

## 6. Website Architecture & Routes

| Route | Page | Purpose | Access |
| :--- | :--- | :--- | :--- |
| `/` | **Landing Page** | Public portal introduction, 4-step workflow, capability showcase | Public |
| `/login` | **Citizen Login** | Two-column government login with validation and security notes | Public / Guest |
| `/register` | **Citizen Registration** | Local demo citizen account creation with privacy consent | Public / Guest |
| `/forgot-password` | **Account Recovery** | Account recovery workflow with simulated SMS reset advice | Public / Guest |
| `/dashboard` | **Citizen Dashboard** | Summary cards, household overview, active applications, alerts | Citizen (Protected) |
| `/records` | **Profile & Family Records**| Individual vs. household records, membership history timeline | Citizen (Protected) |
| `/schemes` | **Schemes Directory** | Searchable & filterable directory (Unit, Category, Keyword) | Public / Citizen |
| `/schemes/:schemeId` | **Scheme Details** | Overview, eligibility, documents, FAQs, benefit unit rules | Public / Citizen |
| `/apply` | **Apply for Benefit** | 5-step application with prefill, mock uploads & receipt | Citizen (Protected) |
| `/applications` | **Application Tracking**| Searchable tracking roster with status badges and filters | Citizen (Protected) |
| `/applications/:appId`| **Application Details** | Complete audit timeline, officer logs, uploaded files | Citizen (Protected) |
| `/benefit-history` | **Benefit History** | Individual vs. household historical welfare entitlement ledger | Citizen (Protected) |
| `/verification-alerts`| **Verification Alerts** | Neutral duplicate-claim review notices and next steps | Citizen (Protected) |
| `/corrections` | **Corrections & Appeals**| Form to submit tenancy proofs and track grievance dockets | Citizen (Protected) |
| `/notifications` | **Notifications Center** | Real-time administrative notices and alert markers | Citizen (Protected) |
| `/help` | **Help & Support** | Frequently asked questions, deduplication policy guide | Public / Citizen |

---

## 7. Testing the Complete Demo Flow

Follow this walkthrough to experience the full UDPAD lifecycle:

1. **Visit Landing Page (`/`):** Explore the 4-step workflow, capabilities and sample schemes.
2. **Citizen Login (`/login`):** Click "Auto Fill" to populate demo credentials (`9876543210` / `Demo@123`) and click "Sign In".
3. **Citizen Dashboard (`/dashboard`):** Notice the greeting for Rajesh Kumar Sharma, the active verification banner, household summary card and metrics.
4. **Inspect Family Records (`/records`):** Review the 5 registered family members, separate dwelling linkages and filter the membership history timeline by life events (Marriage, Birth, Migration, Separation).
5. **Explore Schemes (`/schemes`):** Filter by **Benefit Unit** (`Individual`, `Household`, `Dwelling / Facility`) to understand how different schemes attach to different entities.
6. **Submit a New Application (`/apply`):**
   - Step 1: Verify prefilled applicant details.
   - Step 2: Select dwelling and confirm separate household residence.
   - Step 3: Attach mock supporting documents.
   - Step 4: Review application summary.
   - Step 5: Receive generated acknowledgment receipt with unique `APP-2026-XXXX` reference.
7. **Track Verification Review (`/verification-alerts`):**
   - Review Alert `ALT-2026-0419` for the Household Sanitation Latrine Scheme.
   - Note the neutral wording: *"Your application requires additional verification because a previous benefit record may relate to the same household or facility."*
   - Observe that the son's scholarship (`APP-2026-81093`) was approved without being blocked by this household alert.
8. **Submit Clarification / Appeal (`/corrections`):**
   - Click "Submit Clarification" on the alert.
   - Choose *"Household Relocation / Independent Nuclear Residence"*.
   - Submit your statement detailing separate Rohini residency.
   - Observe the new appeal docket with its status timeline.

---

## 8. Privacy, Security & Scope Boundaries

- **Frontend-Only Prototype:** All server responses, database checks and verification flags are simulated using mock data stored in browser memory / localStorage.
- **No Production Integrations:** Does NOT interface with real UIDAI Aadhaar, DigiLocker, or live government payment switches.
- **No Sensitive Credential Collection:** Does not collect or verify actual Aadhaar numbers, biometric data, OTPs, or bank account passwords.
- **Illustrative Data:** All citizen names, household relationships and addresses are fictional demonstration samples.
# UDPAD
