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

    // 1. SKELETON STATE
    if (!isMounted) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 animate-pulse flex items-center justify-center">
                <div className="w-full h-32 bg-zinc-800 rounded-lg" />
            </div>
        );
    }

    const relevantData = data.filter((h: any) => h.rawHour >= 5 && h.rawHour <= 23);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full h-75 min-h-0">
            <div className="flex justify-between items-center mb-6">
                {/* 🏛️ Dynamic Title Rendered Here */}
                <h3 className="font-bold text-zinc-200">{title}</h3>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Utilization Insights</span>
            </div>

            <div className="w-full h-55 min-h-0">
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
                        <BarChart data={relevantData} barGap={0} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#27272a"
                            />
                            <XAxis
                                dataKey="formattedHour"
                                axisLine={false}
                                tickLine={false}
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