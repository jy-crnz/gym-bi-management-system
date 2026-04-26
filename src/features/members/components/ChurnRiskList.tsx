"use client";

import { AlertTriangle, UserMinus, Clock, ChevronRight, FileBarChart2 } from "lucide-react";
import Link from "next/link";

interface AtRiskMember {
    id: string;
    name: string;
    lastCheckIn: string | null;
    daysInactive: number;
    riskStatus: string;
    isExpired: boolean;
}

export function ChurnRiskList({ members }: { members: AtRiskMember[] }) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">

            {/* 🏛️ RESPONSIVE HEADER: Tightened padding for mobile */}
            <div className="px-4 sm:px-5 py-4 border-b border-zinc-800 bg-red-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    <h3 className="font-bold text-red-400 text-xs sm:text-sm italic tracking-tight uppercase">
                        Revenue at Risk
                    </h3>
                </div>
                <span className="text-[9px] sm:text-[10px] font-black bg-red-500 text-white px-2 py-1 rounded-md uppercase tracking-widest">
                    {members.length} Members
                </span>
            </div>

            <div className="divide-y divide-zinc-800/50">
                {members.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                            Perfect Retention Metric Detected.
                        </p>
                    </div>
                ) : (
                    members.map((member) => (
                        <Link
                            key={member.id}
                            href={`/members/${member.id}`}
                            className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-all group"
                        >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                {/* Member Avatar Icon */}
                                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                                    <UserMinus className={`w-4 h-4 ${member.isExpired ? 'text-red-500' : 'text-zinc-600'} group-hover:scale-110 transition-transform`} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-black text-zinc-100 uppercase italic tracking-tight truncate">
                                        {member.name}
                                    </p>

                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {/* 🏛️ DYNAMIC STATUS: Pulsing dot for expired members */}
                                        <div className={`w-1 h-1 rounded-full ${member.isExpired ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />

                                        <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${member.isExpired ? "text-red-500" : "text-amber-500"
                                            }`}>
                                            {member.riskStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                        </Link>
                    ))
                )}
            </div>

            {/* 🏛️ ACTIONABLE FOOTER: Optimized for mobile touch */}
            <div className="p-3 bg-zinc-950/50 border-t border-zinc-800">
                <Link
                    href="/reports/retention"
                    className="flex items-center justify-center gap-2 w-full text-[9px] font-black text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-[0.2em] py-2"
                >
                    <FileBarChart2 className="w-3 h-3" />
                    Analyze Historical Churn Data
                </Link>
            </div>
        </div>
    );
}