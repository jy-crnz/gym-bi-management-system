"use client";

import { EditGoalButton } from "./EditGoalButton";

interface GoalProps {
    current: number;
    target: number;
    percentage: number;
}

export function GoalTracker({ current, target, percentage }: GoalProps) {
    return (
        /* 🏛️ FIX: Locked container to bg-zinc-900 and standardized hover border */
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm transition-all hover:border-zinc-700">
            <div className="flex justify-between items-end mb-4">
                <div>
                    {/* 🏛️ FIX: Locked title to zinc-200 */}
                    <h3 className="font-bold text-zinc-200">Monthly Revenue Goal</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                            Target: ₱{target.toLocaleString()}
                        </p>
                        <EditGoalButton currentGoal={target} />
                    </div>
                </div>
                <div className="text-right">
                    {/* 🏛️ FIX: Locked percentage text to white */}
                    <span className="text-2xl font-black text-white">
                        {percentage.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* PROGRESS BAR CONTAINER */}
            {/* 🏛️ FIX: Locked track background to zinc-800 and border to zinc-700 */}
            <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="mt-4 flex justify-between items-center">
                {/* 🏛️ FIX: Locked description text to zinc-400 */}
                <p className="text-sm text-zinc-400 font-medium">
                    ₱{current.toLocaleString()} collected of ₱{target.toLocaleString()} monthly target.
                </p>

                {/* Visual indicator for Goal Reached */}
                {percentage >= 100 && (
                    /* 🏛️ FIX: Locked badge to emerald-900/20 background */
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                        Goal Met
                    </span>
                )}
            </div>
        </div>
    );
}