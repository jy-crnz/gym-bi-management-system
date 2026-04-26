// 🏛️ ARCHITECTURE IS KINDNESS: Force Real-Time Data. 
export const dynamic = "force-dynamic";

import { getRetentionReportData } from "@/features/members/queries";
import { ArrowLeft, ShieldAlert, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ExportRetentionButton } from "@/features/members/components/ExportRetentionButton";
import { PrintReportButton } from "@/features/members/components/PrintReportButton";
import { ContactButton } from "@/features/members/components/ContactButton";

interface AtRiskMember {
    id: string;
    name: string;
    email: string;
    inactivityLabel: string;
    riskLevel: string;
    isExpired: boolean;
    churnRiskScore: number;
}

export default async function RetentionReportPage() {
    // 🏛️ Fetch the full analytics dataset
    const atRiskMembers = await getRetentionReportData() as AtRiskMember[];

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8 transition-colors print:bg-white print:p-0 print:h-auto print:block font-sans selection:bg-red-500/30">

            {/* 🏛️ GLOBAL PRINT OVERRIDE: Forces multi-page flow and removes clipping */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    html, body { height: auto !important; overflow: visible !important; background: white !important; }
                    main, .max-w-5xl { display: block !important; height: auto !important; }
                }
            `}} />

            <div className="max-w-5xl mx-auto print:max-w-none print:w-full">

                {/* 🏛️ NAVIGATION BAR: Pushing content to the extreme edges */}
                <div className="flex justify-between items-center mb-16 print:hidden">
                    {/* UPPER LEFT: Breadcrumb */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline text-zinc-500 group-hover:text-white transition-colors">Back to</span>
                        Terminal
                    </Link>

                    {/* UPPER RIGHT: The Action Unit (Compact Pill) */}
                    <div className="flex items-center bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/50 shadow-inner w-fit">
                        {/* 🏛️ UI FIX: Use w-12 for a perfect square icon-button on mobile */}
                        <div className="w-12 sm:w-auto sm:min-w-30">
                            <PrintReportButton />
                        </div>

                        <div className="w-px h-4 bg-zinc-800 mx-1" />

                        <div className="w-12 sm:w-auto sm:min-w-30">
                            <ExportRetentionButton data={atRiskMembers} />
                        </div>
                    </div>
                </div>

                {/* --- 🏛️ PRINT-ONLY HEADER (Official Style) --- */}
                <div className="hidden print:block mb-10 border-b-4 border-black pb-6">
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic text-black">IronBI: Retention Intelligence Report</h1>
                    <div className="flex justify-between items-end mt-4">
                        <div className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">
                            <p>Authorized Terminal Access Only</p>
                            <p>Run Date: {new Date().toLocaleString()}</p>
                        </div>
                        <p className="text-xs font-black text-black uppercase">Total Records: {atRiskMembers.length}</p>
                    </div>
                </div>

                {/* --- 🏛️ HERO SECTION (Screen Only) --- */}
                <header className="flex flex-col items-center text-center space-y-6 mb-16 print:hidden">
                    <div className="relative group">
                        {/* Glow effect for the alert shield */}
                        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full group-hover:bg-red-500/30 transition-all" />
                        <div className="relative p-4 bg-zinc-950 border border-red-500/20 rounded-2xl shadow-2xl">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                            Retention <span className="text-zinc-500">Analysis</span>
                        </h1>
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] italic">
                            Revenue Leakage Diagnostic
                        </p>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-500 font-medium max-w-lg leading-relaxed px-4">
                        Comprehensive diagnostic of revenue leakage. Members are categorized by churn probability based on temporal inactivity thresholds.
                    </p>
                </header>

                {/* --- 🏛️ DATA TABLE --- */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden print:overflow-visible print:border-none print:shadow-none print:bg-white print:block">
                    <div className="overflow-x-auto scrollbar-hide print:overflow-visible print:block">
                        <div className="min-w-187.5 lg:min-w-0 print:min-w-0 print:w-full">
                            <table className="w-full text-left border-collapse print:table-auto">
                                <thead className="bg-zinc-950 text-[9px] uppercase tracking-[0.2em] font-black text-zinc-500 border-b border-zinc-800 print:bg-white print:text-black print:border-b-2 print:border-black">
                                    <tr>
                                        <th className="px-8 py-6">Member Identity</th>
                                        <th className="px-6 py-6 text-center">Status Duration</th>
                                        <th className="px-6 py-6 text-center">Risk Tier</th>
                                        <th className="px-8 py-6 text-right print:hidden">Re-engagement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50 text-zinc-100 print:text-black print:divide-zinc-200">
                                    {atRiskMembers.map((member: AtRiskMember) => {
                                        const isCritical = member.churnRiskScore >= 0.85;
                                        const isChurned = member.churnRiskScore >= 0.95;

                                        return (
                                            <tr key={member.id} className="hover:bg-zinc-800/20 transition-colors group print:break-inside-avoid">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm uppercase italic tracking-tight group-hover:text-red-400 transition-colors">
                                                            {member.name}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-0.5">UID: {member.id.substring(0, 8)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${member.isExpired || member.inactivityLabel === "No Active Pass" ? 'bg-red-500' : 'bg-emerald-500'} ${member.isExpired ? 'animate-pulse' : ''} print:bg-black print:animate-none`} />
                                                            <span className="text-xs font-bold text-zinc-300 print:text-black">{member.inactivityLabel}</span>
                                                        </div>
                                                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest print:text-zinc-400">Inactivity Period</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${isChurned ? 'bg-zinc-950 text-zinc-600 border-zinc-800 print:bg-white print:text-zinc-400 print:border-zinc-200' : isCritical ? 'bg-red-500/10 text-red-500 border-red-500/20 print:bg-white print:text-black print:border-black' : 'bg-orange-500/10 text-orange-500 border-orange-500/20 print:bg-white print:text-zinc-600 print:border-zinc-400'}`}>
                                                        {member.riskLevel}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right print:hidden">
                                                    <ContactButton email={member.email} name={member.name} memberId={member.id} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- 🏛️ FOOTER INSIGHT --- */}
                <footer className="mt-16 p-6 bg-zinc-950 rounded-2xl border border-zinc-800 border-dashed print:border-none print:bg-white print:text-black">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 print:text-black" />
                        <p className="text-[9px] sm:text-[10px] text-zinc-500 text-center uppercase tracking-[0.2em] font-black print:text-black leading-relaxed">
                            BI Intelligence Output: End of Transmission for Reporting Cycle {new Date().getFullYear()}
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}