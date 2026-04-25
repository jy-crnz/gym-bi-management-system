"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

export function DateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentRange = searchParams.get("range") || "30d";

    const handleFilterChange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", range);

        // 1. Update the URL
        router.push(`/?${params.toString()}`, { scroll: false });
        // 2. 🏛️ KINDNESS: Force Next.js to bypass the cache and fetch fresh BI data
        router.refresh();
    };

    // 🏛️ Added "Today" and "Yesterday" to the top of the array
    const options = [
        { label: "Yesterday", value: "yesterday" },
        { label: "Today", value: "today" },
        { label: "Last 7 Days", value: "7d" },
        { label: "Last 30 Days", value: "30d" },
        { label: "Last 90 Days", value: "90d" },
        { label: "All Time", value: "all" },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-sm">
            <div className="pl-3 pr-2 hidden sm:flex items-center justify-center border-r border-zinc-800">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="flex flex-wrap items-center">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleFilterChange(option.value)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${currentRange === option.value
                                ? "bg-zinc-800 text-white shadow-sm"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}