import { getRecentAuditLogs } from "@/lib/audit";
import { Activity, Trash2, UserPlus, Settings, Zap, ShieldAlert } from "lucide-react";
import Link from "next/link";

// 🏛️ VISUAL ENGINE: Maps actions to specific security colors and icons
const getLogStyling = (action: string) => {
    if (action.includes("DELETE")) {
        return { icon: Trash2, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
    }
    if (action.includes("CREATE")) {
        return { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    }
    if (action.includes("SYSTEM")) {
        return { icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    }
    if (action.includes("SETTINGS")) {
        return { icon: Settings, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" };
    }
    // Default fallback
    return { icon: Activity, color: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700" };
};

export async function SystemActivityFeed() {
    const logs = await getRecentAuditLogs(6); // Fetch last 6 actions

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col h-full">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white italic">System Activity</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">Immutable Audit Trail</p>
                </div>
            </div>

            {/* Log Feed */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        No system activity recorded yet.
                    </div>
                ) : (
                    logs.map((log: any) => {
                        const style = getLogStyling(log.action);
                        const Icon = style.icon;

                        return (
                            <div key={log.id} className="flex gap-4 group">
                                {/* Visual Indicator */}
                                <div className="flex flex-col items-center">
                                    <div className={`p-2 rounded-lg border ${style.bg} ${style.border}`}>
                                        <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                                    </div>
                                    <div className="w-px h-full bg-zinc-800/50 my-1 group-last:hidden" />
                                </div>

                                {/* Log Content */}
                                <div className="flex flex-col pb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${style.color}`}>
                                            {log.action}
                                        </span>
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 font-medium mt-1 leading-relaxed">
                                        {log.details}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                                            Author: <span className="text-zinc-400">{log.adminName}</span>
                                        </span>
                                        {log.entityId && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                                                    Target: <span className="font-mono text-zinc-400">{log.entityId.substring(0, 8)}...</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {/* 🏛️ NEW: THE LEDGER BUTTON */}
            <div className="mt-6 pt-4 border-t border-zinc-800/50">
                <Link
                    href="/reports/audit"
                    className="w-full flex items-center justify-center py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white font-black uppercase tracking-[0.2em] transition-all border border-zinc-800 hover:border-zinc-700"
                >
                    Access Master Ledger →
                </Link>
            </div>
        </div>
    );
}