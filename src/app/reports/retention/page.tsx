// 🏛️ ARCHITECTURE IS KINDNESS: Force Real-Time Data. 
export const dynamic = "force-dynamic";

import { getRetentionReportData } from "@/features/members/queries"; // 🏛️ NEW QUERY
import { UserMinus, ArrowLeft, Mail, AlertCircle, ShieldAlert, Ghost } from "lucide-react";
import Link from "next/link";
import { ExportRetentionButton } from "@/features/members/components/ExportRetentionButton";
import { PrintReportButton } from "@/features/members/components/PrintReportButton";
import { ContactButton } from "@/features/members/components/ContactButton";

interface AtRiskMember {
    id: string;
    name: string;
    email: string; // 🏛️ ADD THIS
    inactivityLabel: string;
    riskLevel: string;
    isExpired: boolean;
    churnRiskScore: number;
}

export default async function RetentionReportPage() {
    // 🏛️ Fetch the full analytics dataset
    const atRiskMembers = await getRetentionReportData() as AtRiskMember[];

    return (
        <div className="min-h-screen bg-black p-8 transition-colors print:bg-white print:p-0 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* --- NAVIGATION & ACTIONS (Hidden on Print) --- */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Terminal
                    </Link>

                    <div className="flex gap-3">
                        <PrintReportButton />
                        <ExportRetentionButton data={atRiskMembers} />
                    </div>
                </div>

                {/* --- PRINT-ONLY HEADER --- */}
                <div className="hidden print:block mb-8 border-b-2 border-zinc-900 pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-tighter italic">IronBI: Retention Intelligence Report</h1>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        Run Date: {new Date().toLocaleString()} • Authorized Terminal
                    </p>
                </div>

                {/* --- REPORT HEADER (Screen Only) --- */}
                <header className="mb-10 print:hidden">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                            Retention Analysis
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium max-w-2xl leading-relaxed">
                        Comprehensive diagnostic of revenue leakage. Members are categorized by churn probability based on temporal inactivity thresholds.
                    </p>
                </header>

                {/* --- DATA TABLE --- */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-950 text-[9px] uppercase tracking-[0.2em] font-black text-zinc-500 border-b border-zinc-800 print:bg-zinc-100 print:text-black print:border-zinc-200">
                                <tr>
                                    <th className="px-8 py-5">Member Identity</th>
                                    <th className="px-6 py-5">Status Duration</th>
                                    <th className="px-6 py-5">Risk Tier</th>
                                    <th className="px-8 py-5 text-right print:hidden">Re-engagement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-zinc-100 print:text-black print:divide-zinc-200">
                                {atRiskMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-16 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">
                                            Zero High-Risk Targets Detected. Retention Health Nominal.
                                        </td>
                                    </tr>
                                ) : (
                                    atRiskMembers.map((member: AtRiskMember) => {
                                        // 🏛️ DYNAMIC BADGE LOGIC
                                        const isCritical = member.churnRiskScore >= 0.85;
                                        const isChurned = member.churnRiskScore >= 0.95;

                                        return (
                                            <tr key={member.id} className="hover:bg-zinc-800/20 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm uppercase italic tracking-tight group-hover:text-emerald-400 transition-colors">
                                                            {member.name}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-0.5">UID: {member.id.substring(0, 8)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${member.isExpired || member.inactivityLabel === "No Active Pass"
                                                                ? 'bg-red-500'
                                                                : 'bg-emerald-500'
                                                            } ${member.isExpired ? 'animate-pulse' : ''}`} />
                                                        <span className="text-xs font-bold text-zinc-300">
                                                            {member.inactivityLabel}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${isChurned
                                                            ? 'bg-zinc-950 text-zinc-600 border-zinc-800'
                                                            : isCritical
                                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                        }`}>
                                                        {member.riskLevel}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right print:hidden">
                                                    <ContactButton
                                                        email={member.email}
                                                        name={member.name}
                                                        memberId={member.id} // 🏛️ ENSURE THIS IS HERE
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- FOOTER INSIGHT --- */}
                <footer className="mt-10 p-6 bg-zinc-950 rounded-2xl border border-zinc-800 border-dashed print:border-solid print:bg-white print:text-black">
                    <div className="flex items-center justify-center gap-3">
                        <AlertCircle className="w-4 h-4 text-emerald-500" />
                        <p className="text-[10px] text-zinc-500 text-center uppercase tracking-[0.2em] font-black print:text-black">
                            BI Intelligence: Re-engaging <span className="text-emerald-500">HIGH RISK</span> members within 48h increases win-back rate by 34.2%
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}