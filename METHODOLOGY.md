# Gym Business Intelligence System - Methodology

This document outlines the methodologies, architectural decisions, and technology stack used in the development of the Gym Business Intelligence (BI) System. It serves as a comprehensive reference for understanding how the system is built, structured, and operated.

## 1. System Architecture

The project employs a **Feature-Based Architecture**, transitioning away from traditional separation by file type (e.g., all components in one folder, all hooks in another) towards modularizing the application into scalable, distinct feature domains.

### 1.1 Directory Structure (`src/features/`)
Each feature module is self-contained and typically includes:
- `actions.ts`: Server-side actions and mutations.
- `queries.ts`: Database read operations and BI data extraction.
- `schemas.ts`: Validation schemas (e.g., using Zod) for data integrity.
- `types.ts`: TypeScript type definitions.
- `components/`: Feature-specific React components.
- `hooks/`: Feature-specific React hooks.

**Key Feature Domains:**
- **Analytics:** Handles complex BI queries, financial health metrics, cohort matrices, and report generation.
- **Auth:** Manages user authentication schemas and Supabase SSR integration.
- **Members:** Core CRUD operations for members, goal tracking, churn risk analysis, and QR code generation/scanning.
- **Portal:** Member-facing views, including attendance logging and checking in/out.
- **Transactions:** Financial tracking and history.
- **Inventory:** System setup for gym item tracking.

### 1.2 Routing (`src/app/`)
The application utilizes the **Next.js App Router** for routing, supporting both server-side rendering (SSR) and client-side interactivity.
- `/`: Main administrative dashboard and BI metrics.
- `/login`: Administrative authentication entry point.
- `/members/[id]`: Detailed, individual member profiles.
- `/portal/[id]`: Member-specific portal for self-service actions.
- `/reports/*`: Dedicated routes for specific BI reports (e.g., audit, retention).

---

## 2. Technology Stack

### 2.1 Core Framework
- **Next.js (v16.2):** Used as the full-stack framework providing the App Router, server actions, and API routes.
- **React (v19.2):** UI library for building composable and reactive user interfaces.
- **TypeScript (v5):** Enforces strict typing across the entire codebase to prevent runtime errors and improve developer experience.

### 2.2 Backend & Data Layer
- **PostgreSQL:** The core relational database used for robust data storage.
- **Prisma ORM (v7.7):** Provides a type-safe database client and manages schema migrations.
- **Supabase:** Used for Authentication and Server-Side Rendering (SSR) backend services.
- **Upstash (Redis/Ratelimit):** Used for rate limiting and fast in-memory caching operations.

### 2.3 Styling & UI
- **Tailwind CSS (v4):** Utility-first CSS framework for rapid, responsive UI development without leaving the HTML/JSX.
- **Framer Motion:** Utilized for smooth, declarative animations.
- **Lucide React:** Consistent and modern icon set.

### 2.4 Data Visualization & Reporting
- **Recharts:** Used extensively in the Analytics feature for visualizing BI data (e.g., Revenue Charts, Peak Hours, Tier Distributions).
- **jsPDF & jsPDF-AutoTable:** Enables client-side generation of downloadable PDF reports (e.g., Retention reports).
- **csv-parser:** Facilitates data import and export operations.

### 2.5 Utilities
- **React Hook Form & @hookform/resolvers:** Manages complex form state and validation efficiently.
- **html5-qrcode & qrcode.react:** Drives the core check-in/check-out functionality via QR code scanning and generation.
- **Resend & React Email:** Used for transactional email delivery (e.g., Retention emails).

---

## 3. Database Design & Data Modeling

The database schema (`prisma/schema.prisma`) is explicitly optimized for Business Intelligence, cleanly separating entities into Dimensional and Fact models to facilitate fast aggregation and reporting.

### 3.1 Dimension Models (The "Who" & "What")
- **Member:** Represents the core user. Includes standard identity data alongside pre-calculated BI fields like `churnRiskScore` and `totalSpent` to reduce complex query overhead on dashboards. It also enforces real-world business logic via fields like `passType` (DAY_PASS vs MONTHLY) and `activeUntil`.
- **SystemSettings:** A singleton-like table storing global configurations, such as the dynamic `revenueGoal` used to benchmark business performance.

### 3.2 Fact Models (The "Behavior" & "Value")
- **Attendance:** Logs granular member check-ins and check-outs. This immutable ledger is crucial for calculating facility utilization, peak hours, and member engagement metrics.
- **Transaction:** Records financial events linked to members. Contains specific types (e.g., "Day Pass", "Monthly Renewal") to allow for detailed revenue segmentation and cohort analysis.
- **AuditLog:** Tracks system-wide administrative actions for security and compliance (e.g., who deleted a member or changed a goal).

---

## 4. Security & Development Practices

- **Type Safety:** End-to-end type safety from the database schema (Prisma) to the frontend UI components.
- **Rate Limiting:** Implemented via Upstash to protect API routes and sensitive actions from abuse.
- **Audit Logging:** Critical actions are tracked in the database to maintain an immutable history of administrative changes.
- **Linting & Formatting:** Enforced via ESLint and Prettier (integrated with Next.js) to maintain code quality and stylistic consistency.
