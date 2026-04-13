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
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {/* Header with Lucide Icon */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-red-50/50 dark:bg-red-950/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="font-bold text-red-900 dark:text-red-400 text-sm">
                        Revenue at Risk (Churn Alert)
                    </h3>
                </div>
                <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded-full uppercase">
                    {members.length} Members
                </span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {members.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-sm">
                        All members are currently active. Great retention!
                    </div>
                ) : (
                    members.map((member) => (
                        <div
                            key={member.id}
                            className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                {/* Visual indicator: User icon in a soft circle */}
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <UserMinus className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                        {member.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Clock className="w-3 h-3 text-zinc-400" />
                                        <p className="text-[11px] text-zinc-500">
                                            Inactive for <span className="text-red-500 font-bold">{member.daysInactive} days</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/members/${member.id}`}
                                className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                            </Link>
                        </div>
                    ))
                )}
            </div>

            {/* ACTIONABLE BI: Navigation to full report */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
                <Link
                    href="/reports/retention"
                    className="flex items-center justify-center gap-2 w-full text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors uppercase tracking-widest py-1"
                >
                    <FileBarChart2 className="w-3 h-3" />
                    View Full Retention Report
                </Link>
            </div>
        </div>
    );
}