import Link from "next/link";
import { getPaginatedAuditLogs } from "@/lib/audit";
import { ShieldCheck, Search, Filter, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

// Reuse your visual engine from the widget
const getLogStyling = (action: string) => {
    if (action.includes("DELETE")) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (action.includes("CREATE")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (action.includes("SYSTEM")) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (action.includes("FINANCIAL")) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (action.includes("SETTINGS")) return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    return "text-zinc-400 bg-zinc-800 border-zinc-700";
};

export default async function AuditLedgerPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const query = (searchParams?.q as string) || "";
    const actionFilter = (searchParams?.action as string) || "ALL";
    const page = Number(searchParams?.page) || 1;

    const { data: logs, metadata } = await getPaginatedAuditLogs({
        query,
        action: actionFilter,
        page,
        limit: 50 // Show 50 logs per page
    });

    return (
        <div className="min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/30 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">

                {/* ── HEADER ── */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Terminal
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white italic tracking-tight">Security Ledger</h1>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">Immutable System Audit Trail</p>
                        </div>
                    </div>
                </div>

                {/* ── SEARCH & FILTER ENGINE ── */}
                <form className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4" method="GET">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search by admin name, details, or ID..."
                            className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Action Filter */}
                    <div className="relative md:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <select
                            name="action"
                            defaultValue={actionFilter}
                            className="w-full appearance-none bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            <option value="ALL">All Actions</option>
                            <option value="FINANCIAL">Financial (Payments)</option>
                            <option value="DELETE">Deletions (Destruction)</option>
                            <option value="CREATE">Creation (New Records)</option>
                            <option value="STATUS">Status Changes</option>
                            <option value="SYSTEM">Automated System Interventions</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-colors">
                        Query Logs
                    </button>
                </form>

                {/* ── LOG RESULTS TABLE ── */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recorded Events</span>
                        <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                            Total Records: {metadata.total}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 bg-zinc-950/50 border-b border-zinc-800">
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Action Type</th>
                                    <th className="px-6 py-4">Event Details</th>
                                    <th className="px-6 py-4">Author</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                            No audit logs match your query.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-zinc-300 font-medium">
                                                        {new Date(log.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                                        {new Date(log.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getLogStyling(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 min-w-75">
                                                <p className="text-xs text-zinc-300 leading-relaxed">
                                                    {log.details}
                                                </p>
                                                {log.entityId && (
                                                    <p className="text-[9px] text-zinc-600 font-mono mt-1.5 uppercase">
                                                        Target ID: {log.entityId}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${log.adminName.includes("Automated") ? "bg-blue-500" : "bg-emerald-500"}`} />
                                                    <span className="text-xs font-bold text-zinc-300">{log.adminName}</span>
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
    );
}