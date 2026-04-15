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
 * A11y Kindness: High contrast custom tooltip.
 * 🏛️ FIX: Locked to bg-zinc-800 permanently.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-800 p-3 border border-zinc-700 rounded-lg shadow-lg">
                <p className="text-xs font-bold text-zinc-100 mb-1">
                    {label} (Today)
                </p>
                <p className="text-sm font-black text-blue-400">
                    {payload[0].value.toLocaleString()} Check-ins
                </p>
            </div>
        );
    }
    return null;
};

export function PeakHoursChart({ data }: { data: PeakHourData[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // 1. SKELETON STATE: 🏛️ FIX: Stripped light mode colors
    if (!isMounted) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 animate-pulse flex items-center justify-center">
                <div className="w-full h-32 bg-zinc-800 rounded-lg" />
            </div>
        );
    }

    const relevantData = data.filter((h: any) => h.rawHour >= 5 && h.rawHour <= 23);

    return (
        /* 🏛️ FIX: Locked card to bg-zinc-900 / border-zinc-800 */
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-zinc-200">Today&apos;s Foot Traffic</h3>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Utilization Insights</span>
            </div>

            <div className="w-full h-55 min-h-0">
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
                        <BarChart data={relevantData} barGap={0} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                /* 🏛️ FIX: Locked grid lines to zinc-800 */
                                stroke="#27272a"
                            />
                            <XAxis
                                dataKey="formattedHour"
                                axisLine={false}
                                tickLine={false}
                                /* 🏛️ FIX: High contrast text for dark background */
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                interval={1}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                allowDecimals={false}
                                dx={-10}
                            />

                            {/* 🏛️ FIX: Cursor color set to subtle blue glow */}
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />

                            <Bar
                                dataKey="count"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                activeBar={{ fill: '#60a5fa' }}
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