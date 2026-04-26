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

    // 🏛️ ANTI-CLIPPING LOGIC: K-Formatter for large numbers (e.g., ₱15,000 -> ₱15k)
    const formatYAxis = (value: number) => {
        if (value >= 1000) {
            return `₱${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
        }
        return `₱${value}`;
    };

    // 1. SKELETON STATE: Matches the new responsive heights
    if (!isMounted) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm w-full h-80 sm:h-92.5 animate-pulse flex flex-col gap-6">
                <div className="w-1/2 h-8 bg-zinc-800 rounded-lg" />
                <div className="w-full flex-1 bg-zinc-800/50 rounded-lg" />
            </div>
        );
    }

    return (
        /* 🏛️ FIX: Upgraded to rounded-2xl and responsive padding */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm w-full">

            {/* 🏛️ RESPONSIVE HEADER: Stacks nicely on mobile, side-by-side on PC */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 sm:mb-8 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-black text-zinc-100 uppercase italic tracking-tight">
                    {data.length > 7 ? `${data.length}-Day` : '7-Day'} Revenue Trend
                </h3>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                    Financial Insights
                </span>
            </div>

            {/* 🏛️ RESPONSIVE HEIGHT: Shorter on mobile so users don't get trapped scrolling */}
            <div className="w-full h-55 sm:h-70">
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
                        {/* 🏛️ MARGIN FIX: left: 0 ensures the SVG never draws outside the box and clips the text */}
                        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#27272a"
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                dy={10}
                                /* 🏛️ ANTI-CROWDING FIX: Drops overlapping dates on mobile automatically */
                                minTickGap={20}
                            />
                            {/* 🏛️ Y-AXIS FIX: Fixed width and K-formatter applied to prevent text cutoff */}
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                tickFormatter={formatYAxis}
                                width={40} /* Forces exactly enough room for '₱99k' */
                                dx={-5}    /* Gentle nudge left to align perfectly with the grid */
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