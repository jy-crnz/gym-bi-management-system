"use client";

import { EditGoalButton } from "./EditGoalButton";

interface GoalProps {
    current: number;
    target: number;
    percentage: number;
}

export function GoalTracker({ current, target, percentage }: GoalProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-zinc-200">Monthly Revenue Goal</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                            Target: ₱{target.toLocaleString()}
                        </p>
                        {/* KINDNESS TIP: Inline editing allows the owner to pivot 
                          the strategy without leaving the dashboard view.
                        */}
                        <EditGoalButton currentGoal={target} />
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-black dark:text-white">
                        {percentage.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* PROGRESS BAR CONTAINER */}
            <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <div
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    ₱{current.toLocaleString()} collected of ₱{target.toLocaleString()} monthly target.
                </p>
                {/* Visual indicator for Goal Reached */}
                {percentage >= 100 && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                        Goal Met
                    </span>
                )}
            </div>
        </div>
    );
}