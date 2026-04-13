# Gym Business Intelligence System - Project Overview

## 📌 Project Description
The **Gym Business Intelligence (BI) System** is a modern, full-stack web application designed to manage gym operations, track member behavior, and provide actionable business intelligence. It focuses on tracking memberships, attendance (check-ins/check-outs via QR codes), transactions, and analyzing data such as revenue trends and member churn risks.

## 🛠️ Tech Stack & Tools

### Core Framework & Language
- **Next.js (v16.2)**: React framework with App Router used for both frontend and server-side rendering/API.
- **React (v19.2)**: Library for building user interfaces.
- **TypeScript (v5)**: Strongly typed programming language ensuring type safety across the stack.

### Backend & Database
- **PostgreSQL**: Robust open-source relational database.
- **Prisma ORM (v7.7)**: Type-safe database client and schema migrations (`@prisma/client`, `@prisma/adapter-pg`).
- **Supabase**: Backend-as-a-Service, heavily utilized for Server-Side Rendering (SSR) capabilities (`@supabase/ssr`) and robust database interactions (`@supabase/supabase-js`).
- **pg**: Non-blocking PostgreSQL client for Node.js.

### Styling & UI
- **Tailwind CSS (v4)**: Utility-first CSS framework for rapid and responsive UI development.
- **Lucide React**: Crisp and modern icon library.
- **tailwindcss-animate**: Plugin for seamless CSS animations.

### Data Visualization & Reporting
- **Recharts**: Composable charting library used for rich business intelligence metrics and dashboard visualization.
- **jsPDF & jsPDF-AutoTable**: Tools for generating downloadable PDF reports (like retention and stats) directly from the browser.

### Forms & Validation
- **React Hook Form**: Performant, flexible, and extensible forms with easy-to-use validation.
- **@hookform/resolvers**: Validation resolver connecting React Hook Form with validation schemas.

### Specific Utilities
- **date-fns**: Comprehensive toolset for manipulating and formatting dates.
- **html5-qrcode**: Tooling for scanning QR codes directly from the browser (used for portal check-in/out).
- **qrcode.react**: For generating dynamic Member QR codes.
- **dotenv**: Module to load environment variables securely.

---

## 🏗️ Architecture & Structure

The project strictly follows a **Feature-Based Architecture**, modularizing the application into scalable, distinct feature domains located in `src/features/`.

### Key Features Modules:
- **Analytics**: Handling BI queries, dashboard components (ExportReportButton), and data transformations.
- **Auth**: User authentication schemas, server actions, and Supabase integration logic.
- **Members**: Core CRUD for members, QR generation/scanning features, tier tracking, goal tracking, and specific BI UI (ChurnRiskList, PeakHoursChart).
- **Portal**: The public-facing or member-facing view for attendance logging (AttendanceCalendar, PortalLoginForm).
- **Transactions**: Financial record keeping and history.
- **Inventory**: Setup for gym inventory and item tracking.

### Next.js App Router (`src/app/`):
- `/`: Main Dashboard & BI view
- `/login`: Administrative or User authentication route
- `/members/[id]`: Detailed member profile view
- `/portal/[id]`: Member-specific portal view
- `/reports/retention`: Specific BI report generation pages

---

## 🗄️ Database Schema Overview (Prisma)

The database schema is heavily optimized for BI processing, separating entities into Dimensional and Fact models:

1. **Member (Dimension Model)**: 
   - Tracks the "Who". Includes standard information alongside pre-calculated BI fields like `churnRiskScore` and `totalSpent`.
   - Tracks `MembershipTier` (BASIC, PREMIUM, VIP).
2. **Attendance (Fact Model)**: 
   - Tracks the "Behavior". Logs member check-ins and check-outs over time for peak-hour and facility utilization analysis.
3. **Transaction (Fact Model)**: 
   - Tracks the "Value". Logs granular financial events (memberships, supplements) linked to members.
4. **SystemSettings**: 
   - Stores global configurations like dynamic revenue goals for BI dashboard alignment.