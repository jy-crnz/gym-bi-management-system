"use client";

import { useState, useEffect } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";

interface TierData {
    name: string;
    value: number;
    fill: string;
}

export function TierDistributionChart({ data }: { data: TierData[] }) {
    const [isMounted, setIsMounted] = useState(false);

    // Hydration Guard: Ensures Recharts only renders on the client
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 1. SKELETON STATE: 🏛️ FIX: Matches new responsive heights and padding
    if (!isMounted) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 h-80 sm:h-92.5 w-full animate-pulse flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-zinc-800" />
            </div>
        );
    }

    return (
        /* 🏛️ FIX: Upgraded to rounded-2xl, responsive padding, and dynamic height */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm w-full h-80 sm:h-92.5 flex flex-col transition-all hover:border-zinc-700">

            {/* 🏛️ RESPONSIVE HEADER: Centered on mobile, side-by-side on PC */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 sm:mb-6 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-black text-zinc-100 uppercase italic tracking-tight">
                    Membership Tiers
                </h3>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                    Segment Distribution
                </span>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            animationDuration={1200}
                            cornerRadius={6}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill}
                                    className="outline-none"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: '#18181b', // zinc-900
                                color: '#f4f4f5', // zinc-100
                                fontSize: '12px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'
                            }}
                            itemStyle={{ color: '#f4f4f5', fontWeight: 'bold' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => (
                                /* 🏛️ FIX: Standardized legend text color */
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter ml-1">
                                    {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}