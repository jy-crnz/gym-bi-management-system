import Image from "next/image";
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

// ARCHITECTURE KINDNESS: Import the data engines
import {
  getMembers,
  getGymStats,
  getRevenueTrend,
  getPeakHoursData,
  getChurnRiskMembers,
  getRevenueGoalProgress,
  getMembershipDistribution
} from "@/features/members/queries";

/**
 * 🏛️ PRODUCTION DIRECTIVE
 * Forces the page to be dynamic. Without this, Next.js caches the dashboard
 * as a static HTML file, which is why your charts previously stayed at 0.
 */
export const dynamic = "force-dynamic";

// ARCHITECTURE KINDNESS: Explicit types for serialized data from the server
interface SerializedMember {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED";
  tier: "BASIC" | "PREMIUM" | "VIP";
  createdAt: string;
}

export default async function Home() {
  /**
   * DATA FOUNDATIONS:
   * Parallel fetching ensures the dashboard loads all BI streams simultaneously.
   * This is much faster than fetching them one-by-one (Waterfall).
   */
  const [members, stats, trend, peakHours, churnRisk, goal, tiers] = await Promise.all([
    getMembers() as Promise<SerializedMember[]>,
    getGymStats(),
    getRevenueTrend(),
    getPeakHoursData(),
    getChurnRiskMembers(),
    getRevenueGoalProgress(),
    getMembershipDistribution()
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black transition-colors">

      {/* --- HEADER SECTION --- */}
      <header className="w-full max-w-5xl mx-auto pt-12 px-8 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <Image
            className="dark:invert w-auto h-8"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
            style={{ height: '32px', width: 'auto' }}
          />
          <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 mx-2" />
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              GYM BI SYSTEM
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Analytics Dashboard
            </p>
          </div>
        </div>

        {/* BI & OPS CONTROLS: Enhanced with Sign Out and QR Scanner */}
        <div className="hidden md:flex flex-col items-end gap-3 text-right">
          <div className="flex items-center gap-2">
            <QRScanner />
            <ExportReportButton data={{ stats, tiers }} />
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <SignOutButton />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              System Active
            </p>
            <p className="text-[10px] text-zinc-500 font-medium italic">Terminal Verified</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto py-12 px-8">

        {/* --- BI KPI SECTION: Executive Overview --- */}
        <StatsGrid
          total={stats.totalMembers}
          active={stats.activeMembers}
          today={stats.todayAttendance}
          revenue={stats.totalRevenue}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-8">

          {/* --- LEFT COLUMN: TRENDS & INPUTS --- */}
          <div className="space-y-8">
            <GoalTracker
              current={goal.current}
              target={goal.target}
              percentage={goal.percentage}
            />
            <RevenueChart data={trend} />
            <PeakHoursChart data={peakHours} />
            <ChurnRiskList members={churnRisk} />

            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                Data Foundations
              </h1>
              <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400">
                Capture behavior patterns to generate the data required for advanced churn and utilization analytics.
              </p>
            </div>

            <RegistrationForm />
          </div>

          {/* --- RIGHT COLUMN: SEGMENTATION & DIRECTORY --- */}
          <div className="space-y-8 sticky top-8">

            {/* 1. BI Visualization: Tier Distribution */}
            <TierDistributionChart data={tiers} />

            {/* 2. Operational Directory */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Recent Registrations</h3>
                <span className="text-[10px] font-medium bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400">
                  {members.length} Total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-4 py-3 font-bold">Member</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-zinc-400">
                          No members found.
                        </td>
                      </tr>
                    ) : (
                      members.map((member: SerializedMember) => (
                        <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <Link
                                href={`/members/${member.id}`}
                                className="font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                {member.name}
                              </Link>
                              <span className={`text-[9px] font-black uppercase tracking-widest w-fit px-1.5 rounded ${member.tier === 'VIP' ? 'bg-amber-100 text-amber-700' :
                                member.tier === 'PREMIUM' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                {member.tier}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-tight">
                              {member.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
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
        </div>

        {/* --- FOOTER SECTION --- */}
        <div className="mt-20 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-6 items-center sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={16}
                className="dark:invert"
                style={{ width: 'auto', height: 'auto' }}
              />
              Deploy Project
            </a>
          </div>

          <p className="text-sm text-zinc-500 italic">
            TUP Manila • BSIT - 3A • Jay Lawrence Cerniaz
          </p>
        </div>
      </main>
    </div>
  );
}