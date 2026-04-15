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

    // Loading State: 🏛️ FIX: Stripped bg-white and dark: classes. Locked to bg-zinc-900.
    if (!isMounted) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-zinc-800" />
            </div>
        );
    }

    return (
        /* 🏛️ FIX: Locked container to bg-zinc-900 / border-zinc-800 permanently */
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm h-80 flex flex-col transition-all hover:border-zinc-700">
            <h3 className="font-bold text-zinc-200 mb-1">Membership Tiers</h3>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium mb-4">
                Segment Distribution
            </p>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }} >
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
                            itemStyle={{ color: '#f4f4f5' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => (
                                /* 🏛️ FIX: Standardized legend text color for dark mode */
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
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