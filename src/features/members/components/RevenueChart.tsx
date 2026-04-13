"use client";

import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface TrendData {
    date: string;
    amount: number;
}

/**
 * ARCHITECTURE KINDNESS: Custom Tooltip
 * Handles accessibility (A11y) by ensuring high contrast text
 * and dark mode compatibility.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-zinc-800 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 mb-1">
                    {label}
                </p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ₱{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function RevenueChart({ data }: { data: TrendData[] }) {
    // HYDRATION GUARD: Prevents state updates before component mounts
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        /**
         * FINAL BOSS FIX: Deferred Mounting
         * Waiting 100ms ensures the Tailwind layout is 100% computed
         * before Recharts tries to calculate its height/width.
         */
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // 1. SKELETON STATE: Prevents Layout Shift using canonical classes
    if (!isMounted) {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 animate-pulse flex items-center justify-center">
                <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            </div>
        );
    }

    return (
        /* CANONICAL FIX: Used h-75 and added min-h-0 for layout stability */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-zinc-200">7-Day Revenue Trend</h3>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Financial Insights</span>
            </div>

            {/* TERMINAL WARNING FIX: h-55 wrapper provides fixed bounds. */}
            <div className="w-full h-55 min-h-0">
                {/* FINAL SILENCE FIX: Conditional render + debounce */}
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 } }>
                        <LineChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e2e8f0"
                                className="dark:stroke-zinc-800"
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                tickFormatter={(value) => `₱${value}`}
                                dx={-10}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                            />

                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full bg-transparent" />
                )}
            </div>
        </div>
    );
}