"use client";

import { EditGoalButton } from "./EditGoalButton";
import { TrendingUp } from "lucide-react";

interface GoalProps {
    current: number;
    target: number;
    percentage: number;
}

export function GoalTracker({ current, target, percentage }: GoalProps) {
    const isCompleted = percentage >= 100;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm w-full transition-all hover:border-zinc-700 group">

            <div className="flex justify-between items-end mb-5">
                <div>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-100 uppercase italic tracking-tight">
                        Monthly Revenue Goal
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold">
                            Target: ₱{target.toLocaleString()}
                        </p>
                        <EditGoalButton currentGoal={target} />
                    </div>
                </div>
                <div className="text-right">
                    {/* 🏛️ UI POLISH: If over 100%, let the number reflect it, but keep the styling sharp */}
                    <span className={`text-3xl sm:text-4xl font-black italic tracking-tighter leading-none ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                        {percentage.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* PROGRESS BAR CONTAINER */}
            <div className="w-full h-4 sm:h-5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 shadow-inner relative">
                <div
                    /* 🏛️ ARCHITECTURE FIX: Math.min ensures the visual bar never breaks out of the container */
                    className={`h-full transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-linear-to-r from-emerald-500 to-emerald-400' : 'bg-emerald-500'
                        }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                >
                    {/* Subtle top-highlight for the glass/LED effect */}
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-white/20 rounded-full" />
                </div>
            </div>

            <div className="mt-5 flex gap-4 justify-between items-start sm:items-center">
                {/* 🏛️ TYPOGRAPHY FIX: Highlighted the current collected amount so it stands out */}
                <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed">
                    <span className="text-zinc-200 font-black tracking-tight">₱{current.toLocaleString()}</span> collected of ₱{target.toLocaleString()} monthly target.
                </p>

                {/* 🏛️ BADGE UPGRADE: Added Lucide Icon, better padding, and a subtle drop shadow */}
                {isCompleted && (
                    <div className="shrink-0 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="whitespace-nowrap text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                            Goal Met
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}