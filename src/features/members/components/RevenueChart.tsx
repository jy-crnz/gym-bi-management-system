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
 * 🏛️ FIX: Locked to bg-zinc-800 permanently.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-800 p-3 border border-zinc-700 rounded-lg shadow-lg">
                <p className="text-xs font-bold text-zinc-100 mb-1">
                    {label}
                </p>
                <p className="text-sm font-black text-emerald-400">
                    ₱{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function RevenueChart({ data }: { data: TrendData[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // 1. SKELETON STATE: 🏛️ FIX: Stripped light mode colors.
    if (!isMounted) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 animate-pulse flex items-center justify-center">
                <div className="w-full h-32 bg-zinc-800 rounded-lg" />
            </div>
        );
    }

    return (
        /* 🏛️ FIX: Locked card to bg-zinc-900 / border-zinc-800 */
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-zinc-200">7-Day Revenue Trend</h3>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Financial Insights</span>
            </div>

            <div className="w-full h-55 min-h-0">
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
                        <LineChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                /* 🏛️ FIX: Locked grid lines to zinc-800 */
                                stroke="#27272a"
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                tickFormatter={(value) => `₱${value}`}
                                dx={-10}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                            />

                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#10b981"
                                strokeWidth={3}
                                /* 🏛️ FIX: Dot stroke changed from white to zinc-900 to blend with background */
                                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#18181b' }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
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