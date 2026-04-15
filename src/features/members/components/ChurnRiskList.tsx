"use client";

import { AlertTriangle, UserMinus, Clock, ChevronRight, FileBarChart2 } from "lucide-react";
import Link from "next/link";

interface AtRiskMember {
    id: string;
    name: string;
    lastCheckIn: string | null;
    daysInactive: number;
}

export function ChurnRiskList({ members }: { members: AtRiskMember[] }) {
    return (
        /* 🏛️ FIX: Locked main container to bg-zinc-900 / border-zinc-800 */
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">

            {/* Header Section */}
            {/* 🏛️ FIX: Locked to dark red-950/20. Removed red-50 light mode background. */}
            <div className="p-4 border-b border-zinc-800 bg-red-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="font-bold text-red-400 text-sm">
                        Revenue at Risk (Churn Alert)
                    </h3>
                </div>
                {/* 🏛️ FIX: Standardized alert badge to deep red theme */}
                <span className="text-[10px] font-bold bg-red-900/30 text-red-400 px-2 py-1 rounded-full uppercase">
                    {members.length} Members
                </span>
            </div>

            <div className="divide-y divide-zinc-800">
                {members.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                        All members are currently active. Great retention!
                    </div>
                ) : (
                    members.map((member) => (
                        <div
                            key={member.id}
                            /* 🏛️ FIX: Locked row hover state to zinc-800/50 */
                            className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                {/* 🏛️ FIX: Locked icon circle to bg-zinc-800 */}
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <UserMinus className="w-4 h-4 text-zinc-500" />
                                </div>
                                <div>
                                    {/* 🏛️ FIX: Locked name text to zinc-100 */}
                                    <p className="text-sm font-semibold text-zinc-100">
                                        {member.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Clock className="w-3 h-3 text-zinc-500" />
                                        <p className="text-[11px] text-zinc-500">
                                            Inactive for <span className="text-red-500 font-bold">{member.daysInactive} days</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/members/${member.id}`}
                                /* 🏛️ FIX: Standardized link hover state */
                                className="p-2 rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                            </Link>
                        </div>
                    ))
                )}
            </div>

            {/* ACTIONABLE BI: Navigation to full report */}
            {/* 🏛️ FIX: Locked footer to bg-zinc-800/50. Stripped bg-zinc-50 light mode. */}
            <div className="p-3 bg-zinc-800/50 border-t border-zinc-800">
                <Link
                    href="/reports/retention"
                    className="flex items-center justify-center gap-2 w-full text-[11px] font-bold text-zinc-500 hover:text-zinc-100 transition-colors uppercase tracking-widest py-1"
                >
                    <FileBarChart2 className="w-3 h-3" />
                    View Full Retention Report
                </Link>
            </div>
        </div>
    );
}