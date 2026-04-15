import Link from "next/link";
import { RegistrationForm } from "@/features/members/components/RegistrationForm";
import { CheckInButton } from "@/features/members/components/CheckInButton";
import { PaymentButton } from "@/features/members/components/PaymentButton";
import { StatsGrid } from "@/features/members/components/StatsGrid";
import { RevenueChart } from "@/features/members/components/RevenueChart";
import { PeakHoursChart } from "@/features/members/components/PeakHoursChart";
import { ChurnRiskList } from "@/features/members/components/ChurnRiskList";
import { GoalTracker } from "@/features/members/components/GoalTracker";
import { ExportReportButton } from "@/features/analytics/components/ExportReportButton";
import { QRScanner } from "@/features/members/components/QRScanner";
import { TierDistributionChart } from "../features/members/components/TierDistributionChart";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

// 🏛️ Analytics Components
import { DateFilter } from "@/features/analytics/components/DateFilter";
import { FinancialHealth } from "@/features/analytics/components/FinancialHealth";
import { CohortMatrix } from "@/features/analytics/components/CohortMatrix";
import { DirectoryControls } from "@/features/members/components/DirectoryControls"; // ⬅️ NEW FEATURE

import {
  getMembers,
  getGymStats,
  getRevenueTrend,
  getPeakHoursData,
  getChurnRiskMembers,
  getRevenueGoalProgress,
  getMembershipDistribution,
  getFinancialHealth,
  getCohortRetention,
} from "@/features/members/queries";

export const dynamic = "force-dynamic";

interface SerializedMember {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED";
  tier: "BASIC" | "PREMIUM" | "VIP";
  createdAt: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 5v14M18 5v14" />
      <path d="M9 5h6M9 19h6" />
      <rect x="3" y="8" width="3" height="8" rx="1" />
      <rect x="18" y="8" width="3" height="8" rx="1" />
      <path d="M9 12h6" />
    </svg>
  );
}

// ─── Reusable UI pieces ───────────────────────────────────────────────────────

function LivePill() {
  return (
    <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
      <span className="text-[10px] text-zinc-500 font-medium">· System active</span>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 mt-12 first:mt-0">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

function TierBadge({ tier }: { tier: SerializedMember["tier"] }) {
  const styles: Record<SerializedMember["tier"], string> = {
    VIP: "bg-amber-500/10  text-amber-400  ring-1 ring-amber-500/20",
    PREMIUM: "bg-blue-500/10   text-blue-400   ring-1 ring-blue-500/20",
    BASIC: "bg-zinc-700/60   text-zinc-400   ring-1 ring-zinc-600/40",
  };
  return (
    <span className={`w-fit inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${styles[tier]}`}>
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: SerializedMember["status"] }) {
  const styles: Record<SerializedMember["status"], string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    INACTIVE: "bg-zinc-700/60   text-zinc-500   ring-1 ring-zinc-600/40",
    CANCELLED: "bg-red-500/10    text-red-400    ring-1 ring-red-500/20",
  };
  return (
    <span className={`w-fit inline-flex text-[10px] font-bold uppercase tracking-tight px-2.5 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function MemberAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const palettes = [
    "bg-emerald-500/15 text-emerald-400", "bg-blue-500/15 text-blue-400",
    "bg-amber-500/15 text-amber-400", "bg-violet-500/15 text-violet-400",
    "bg-rose-500/15 text-rose-400",
  ];
  const color = palettes[initials.charCodeAt(0) % palettes.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// 🏛️ Next.js 15: searchParams is a Promise
export default async function Home(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. Unwrap the Promise safely
  const searchParams = await props.searchParams;

  // 2. Extract ALL parameters from the URL
  const range = (searchParams?.range as string) || "30d";
  const query = (searchParams?.q as string) || "";
  const status = (searchParams?.status as string) || undefined;
  const tier = (searchParams?.tier as string) || undefined;
  const page = Number(searchParams?.page) || 1;

  // 3. Fetch the data streams
  const stats = await getGymStats(range);
  const financials = await getFinancialHealth(range);
  const trend = await getRevenueTrend(range);
  const peakHours = await getPeakHoursData(range);
  const churnRisk = await getChurnRiskMembers(range);
  const goal = await getRevenueGoalProgress(range);
  const tiers = await getMembershipDistribution(range);
  const cohortData = await getCohortRetention();

  // 🏛️ NEW: Fetch Paginated & Filtered Members
  const membersResult = await getMembers({ range, page, query, status, tier });
  const members = membersResult.data as SerializedMember[];
  const metadata = membersResult.metadata;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/30">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <DumbbellIcon className="w-4 h-4 text-zinc-950" />
            </div>
            <div className="leading-none">
              <p className="text-base font-black text-white tracking-tight">
                Iron<span className="text-emerald-400">BI</span>
              </p>
              <p className="text-[9px] text-zinc-500 uppercase tracking-[0.15em] font-bold mt-0.5">
                Terminal
              </p>
            </div>
          </div>

          <div className="hidden sm:block">
            <LivePill />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <QRScanner />
            <ExportReportButton data={{ stats, tiers }} />
            <div className="hidden md:block w-px h-5 bg-zinc-800 mx-2" />
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">

        {/* --- PAGE INTRO & FILTERS --- */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Command Center
            </h1>
            <p className="text-sm text-zinc-500 mt-1.5">
              Real-time operations and revenue intelligence for your facility.
            </p>
          </div>
          <DateFilter />
        </div>

        {/* =========================================================================
            ZONE 1: EXECUTIVE PULSE (High-level metrics)
        ========================================================================= */}
        <SectionDivider label="Executive Pulse" />
        <StatsGrid
          total={stats.totalMembers}
          active={stats.activeMembers}
          today={stats.todayAttendance}
          revenue={stats.totalRevenue}
        />
        <FinancialHealth arpu={financials.arpu} cltv={financials.cltv} />

        {/* =========================================================================
            ZONE 2: OPERATIONS DESK (Daily tasks: Register & Check-in)
        ========================================================================= */}
        <SectionDivider label="Operations Desk" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* Left: Registration (1/3 width) */}
          <div className="xl:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 xl:sticky xl:top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 font-bold text-lg">+</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">New Member</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Quick Onboarding</p>
              </div>
            </div>
            <RegistrationForm />
          </div>

          {/* Right: Member Directory (2/3 width) */}
          <div className="xl:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">

            <div className="px-6 py-4 flex items-center justify-between bg-zinc-900">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Live Directory</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Manage and check-in active members</p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                {metadata.total} Total Matches
              </span>
            </div>

            {/* 🏛️ NEW: Search, Filter, and Pagination Controls */}
            <DirectoryControls totalPages={metadata.totalPages} currentPage={metadata.currentPage} />

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 bg-zinc-950/50">
                    <th className="px-6 py-3">Member Details</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-6 py-3 text-right">Terminal Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <DumbbellIcon className="w-8 h-8 text-zinc-700" />
                          <span className="text-sm text-zinc-500">No members found matching these filters.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    members.map((member: SerializedMember) => (
                      <tr key={member.id} className="hover:bg-zinc-800/40 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <MemberAvatar name={member.name} />
                            <div className="flex flex-col gap-1 min-w-0">
                              <Link href={`/members/${member.id}`} className="font-semibold text-zinc-100 hover:text-emerald-400 transition-colors truncate text-sm">
                                {member.name}
                              </Link>
                              <TierBadge tier={member.tier} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={member.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                            <CheckInButton memberId={member.id} />
                            <PaymentButton memberId={member.id} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ZONE 3: BUSINESS INTELLIGENCE (Charts & Deep Analytics)
        ========================================================================= */}
        <SectionDivider label="Business Intelligence" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Financial Trends */}
          <div className="space-y-8">
            <GoalTracker current={goal.current} target={goal.target} percentage={goal.percentage} />
            <RevenueChart data={trend} />
            <TierDistributionChart data={tiers} />
          </div>

          {/* Right: Utilization & Risk */}
          <div className="space-y-8">
            <PeakHoursChart data={peakHours} />
            <ChurnRiskList members={churnRisk} />
          </div>
        </div>

        {/* =========================================================================
            ZONE 4: RETENTION MACHINE LEARNING (The Showstopper)
        ========================================================================= */}
        <SectionDivider label="Long-term Retention Analytics" />
        <CohortMatrix data={cohortData} />

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-zinc-800 mt-12 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/20 text-emerald-500">
              <DumbbellIcon className="w-3 h-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-zinc-300 tracking-tight">IronBI Architecture</span>
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mt-0.5">Secure Terminal</span>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-zinc-400 font-medium">TUP Manila · BSIT-3A · <span className="text-zinc-300 font-bold">Fly High Coders</span></p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Capstone v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}