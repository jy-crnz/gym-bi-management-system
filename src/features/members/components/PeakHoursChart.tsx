"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface PeakHourData {
    formattedHour: string;
    count: number;
    rawHour?: number;
}

/**
 * A11y Kindness: High contrast custom tooltip for dark mode.
 * Optimized for scannability in an operational environment.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-zinc-800 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 mb-1">
                    {label} (Today)
                </p>
                <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                    {payload[0].value.toLocaleString()} Check-ins
                </p>
            </div>
        );
    }
    return null;
};

export function PeakHoursChart({ data }: { data: PeakHourData[] }) {
    // HYDRATION GUARD: Ensures the chart only renders on the client
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

    // 1. SKELETON STATE: Prevents Layout Shift while JS loads
    if (!isMounted) {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 animate-pulse flex items-center justify-center">
                <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            </div>
        );
    }

    // KINDNESS: Only show active hours (5 AM - 11 PM) to maximize density
    const relevantData = data.filter((h: any) => h.rawHour >= 5 && h.rawHour <= 23);

    return (
        /* CANONICAL FIX: Used h-75 and added min-h-0 for layout stability */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-zinc-200">Today's Foot Traffic</h3>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Utilization Insights</span>
            </div>

            {/* TERMINAL WARNING FIX: h-55 wrapper provides fixed bounds. */}
            <div className="w-full h-55 min-h-0">
                {/* FINAL SILENCE FIX: 
                  We only render ResponsiveContainer if isMounted is true.
                  This ensures the server never attempts to calculate chart width.
                */}
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 } }>
                        <BarChart data={relevantData} barGap={0} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e2e8f0"
                                className="dark:stroke-zinc-800"
                            />
                            <XAxis
                                dataKey="formattedHour"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                interval={1}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                allowDecimals={false}
                                dx={-10}
                            />

                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />

                            <Bar
                                dataKey="count"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                activeBar={{ fill: '#2563eb' }}
                                animationDuration={1500}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full bg-transparent" />
                )}
            </div>
        </div>
    );
}