// 🏛️ ARCHITECTURE IS KINDNESS: Force Real-Time Data. 
// Prevents the "Time Capsule" bug where production caches daysInactive.
export const dynamic = "force-dynamic";

import { getChurnRiskMembers } from "@/features/members/queries";
import { UserMinus, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { ExportRetentionButton } from "@/features/members/components/ExportRetentionButton";
import { PrintReportButton } from "@/features/members/components/PrintReportButton";

interface AtRiskMember {
    id: string;
    name: string;
    lastCheckIn: string | null;
    daysInactive: number;
}

export default async function RetentionReportPage() {
    // Fetch data on the server (now guaranteed to run on every request)
    const atRiskMembers = await getChurnRiskMembers() as AtRiskMember[];

    return (
        /* 🏛️ FIX: Locked to bg-black. Removed bg-zinc-50 and dark: prefix. */
        <div className="min-h-screen bg-black p-8 transition-colors print:bg-white print:p-0">
            <div className="max-w-5xl mx-auto">

                {/* --- NAVIGATION & ACTIONS (Hidden on Print) --- */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <Link
                        href="/"
                        /* 🏛️ FIX: Locked hover to text-white */
                        className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex gap-3">
                        <PrintReportButton />
                        <ExportRetentionButton data={atRiskMembers} />
                    </div>
                </div>

                {/* --- PRINT-ONLY HEADER --- */}
                <div className="hidden print:block mb-8 border-b-2 border-zinc-900 pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Gym BI System: Retention Report</h1>
                    <p className="text-sm font-medium text-zinc-600">
                        Generated on: {new Date().toLocaleDateString()} • IronBI
                    </p>
                </div>

                {/* --- REPORT HEADER (Screen Only) --- */}
                <header className="mb-8 print:hidden">
                    {/* 🏛️ FIX: Locked title to white */}
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-white">
                        Retention Analysis
                    </h1>
                    <p className="text-zinc-400">
                        Detailed breakdown of members at risk of churning based on 30+ days of inactivity.
                    </p>
                </header>

                {/* --- DATA TABLE --- */}
                {/* 🏛️ FIX: Locked to bg-zinc-900 / border-zinc-800 */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none print:bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-800/50 text-[10px] uppercase tracking-widest font-bold text-zinc-400 border-b border-zinc-800 print:bg-zinc-100 print:text-black print:border-zinc-200">
                                <tr>
                                    <th className="px-6 py-4">Member</th>
                                    <th className="px-6 py-4">Inactivity Period</th>
                                    <th className="px-6 py-4">Risk Level</th>
                                    <th className="px-6 py-4 text-right print:hidden">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-zinc-100 print:text-black print:divide-zinc-200">
                                {atRiskMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-sm">
                                            No high-risk members identified. Retention is optimal!
                                        </td>
                                    </tr>
                                ) : (
                                    atRiskMembers.map((member: AtRiskMember) => (
                                        <tr
                                            key={member.id}
                                            /* 🏛️ FIX: Locked hover state to zinc-800/30 */
                                            className="hover:bg-zinc-800/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-semibold italic lg:not-italic">
                                                {member.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {member.daysInactive} Days
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${member.daysInactive > 60
                                                    ? 'bg-red-900/30 text-red-400 print:bg-zinc-200 print:text-black'
                                                    : 'bg-orange-900/30 text-orange-400 print:bg-zinc-100 print:text-black'
                                                    }`}>
                                                    {member.daysInactive > 60 ? 'Critical' : 'High Risk'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right print:hidden">
                                                {/* 🏛️ FIX: Locked link to blue-400 */}
                                                <button className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-bold hover:underline">
                                                    <Mail className="w-3 h-3" />
                                                    Send Email
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- FOOTER INSIGHT --- */}
                {/* 🏛️ FIX: Locked to bg-zinc-900/50 and border-zinc-700 */}
                <footer className="mt-8 p-4 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-700 print:border-solid print:bg-white print:text-black">
                    <p className="text-[11px] text-zinc-400 text-center uppercase tracking-widest font-medium print:text-black">
                        BI Insight: Re-engaging members within 45 days increases retention by 22%
                    </p>
                </footer>
            </div>
        </div>
    );
}