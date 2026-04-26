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
 * 🏛️ FIX: Now accepts dynamic range text so it doesn't always say "(Today)"
 */
const CustomTooltip = ({ active, payload, label, rangeTooltip }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-800 p-3 border border-zinc-700 rounded-lg shadow-lg">
                <p className="text-xs font-bold text-zinc-100 mb-1">
                    {label} <span className="text-zinc-400 font-normal">{rangeTooltip}</span>
                </p>
                <p className="text-sm font-black text-blue-400">
                    {payload[0].value.toLocaleString()} Check-ins
                </p>
            </div>
        );
    }
    return null;
};

export function PeakHoursChart({ data, range = "30d" }: { data: PeakHourData[], range?: string }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // 🧠 BI Logic: Map the URL range to a human-readable title
    const getChartTitles = (currentRange: string) => {
        switch (currentRange) {
            case "today": return { title: "Today's Live Traffic", tooltip: "(Today)" };
            case "yesterday": return { title: "Yesterday's Foot Traffic", tooltip: "(Yesterday)" };
            case "7d": return { title: "Peak Hours Volume", tooltip: "(Last 7 Days Avg)" };
            case "30d": return { title: "Peak Hours Volume", tooltip: "(Last 30 Days Avg)" };
            default: return { title: "Foot Traffic Analysis", tooltip: "(Selected Range)" };
        }
    };

    const { title, tooltip } = getChartTitles(range);

    // 🏛️ ANTI-CLIPPING LOGIC: K-Formatter for large check-in numbers
    const formatYAxis = (value: number) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
        }
        return `${value}`;
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

    // Filter to only show active gym hours (5 AM to 11 PM)
    const relevantData = data.filter((h: any) => h.rawHour >= 5 && h.rawHour <= 23);

    return (
        /* 🏛️ FIX: Upgraded to rounded-2xl and responsive padding */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm w-full">

            {/* 🏛️ RESPONSIVE HEADER: Centered on mobile, side-by-side on PC */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 sm:mb-8 text-center sm:text-left">
                {/* 🏛️ Dynamic Title Rendered Here */}
                <h3 className="text-lg sm:text-xl font-black text-zinc-100 uppercase italic tracking-tight">{title}</h3>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                    Utilization Insights
                </span>
            </div>

            {/* 🏛️ RESPONSIVE HEIGHT: Shorter on mobile so users don't get trapped scrolling */}
            <div className="w-full h-55 sm:h-70">
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
                        {/* 🏛️ MARGIN FIX: left: 0 ensures the SVG never draws outside the box and clips the text */}
                        <BarChart data={relevantData} barGap={0} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#27272a"
                            />
                            <XAxis
                                dataKey="formattedHour"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 9, fontWeight: 500 }}
                                dy={10}
                                /* 🏛️ ANTI-COLLISION FIX: Drops overlapping hourly labels on mobile automatically */
                                minTickGap={15}
                            /* REMOVED interval={1} so minTickGap can do its job properly */
                            />
                            {/* 🏛️ Y-AXIS FIX: Fixed width and K-formatter applied to prevent text cutoff */}
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                tickFormatter={formatYAxis}
                                allowDecimals={false}
                                width={35}
                                dx={-5}
                            />

                            {/* 🏛️ Dynamic Tooltip Prop Passed Here */}
                            <Tooltip
                                content={<CustomTooltip rangeTooltip={tooltip} />}
                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                            />

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