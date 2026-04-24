"use client";

import { AlertTriangle, UserMinus, Clock, ChevronRight, FileBarChart2 } from "lucide-react";
import Link from "next/link";

interface AtRiskMember {
    id: string;
    name: string;
    lastCheckIn: string | null;
    daysInactive: number;
    riskStatus: string; // 🏛️ NEW: Pulled from our updated query
    isExpired: boolean; // 🏛️ NEW: Used for conditional styling
}

export function ChurnRiskList({ members }: { members: AtRiskMember[] }) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">

            {/* Header Section */}
            <div className="p-4 border-b border-zinc-800 bg-red-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="font-bold text-red-400 text-sm italic tracking-tight">
                        Revenue at Risk (Churn Alert)
                    </h3>
                </div>
                <span className="text-[10px] font-black bg-red-900/30 text-red-400 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                    {members.length} Members
                </span>
            </div>

            <div className="divide-y divide-zinc-800">
                {members.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        Perfect Retention Metric Detected.
                    </div>
                ) : (
                    members.map((member) => (
                        <div
                            key={member.id}
                            className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                                    <UserMinus className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-zinc-100 uppercase italic tracking-tight">
                                        {member.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Clock className="w-3 h-3 text-zinc-600" />
                                        {/* 🏛️ UI UPGRADE: Using riskStatus instead of hardcoded math */}
                                        <p className="text-[10px] font-bold uppercase tracking-widest">
                                            <span className={member.isExpired ? "text-red-500" : "text-emerald-500"}>
                                                {member.riskStatus}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/members/${member.id}`}
                                className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all active:scale-95"
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                            </Link>
                        </div>
                    ))
                )}
            </div>

            {/* ACTIONABLE BI: Navigation to full report */}
            <div className="p-3 bg-zinc-950/50 border-t border-zinc-800">
                <Link
                    href="/reports/retention"
                    className="flex items-center justify-center gap-2 w-full text-[9px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em] py-2"
                >
                    <FileBarChart2 className="w-3 h-3" />
                    Analyze Historical Churn Data
                </Link>
            </div>
        </div>
    );
}