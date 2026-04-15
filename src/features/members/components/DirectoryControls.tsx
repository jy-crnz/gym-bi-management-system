"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export function DirectoryControls({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for the search input so it doesn't stutter while typing
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

    // Debounce the search (waits 300ms after typing stops before updating the URL)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleUpdateUrl("q", searchTerm);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleUpdateUrl = (key: string, value: string | number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "ALL") {
            params.set(key, String(value));
        } else {
            params.delete(key);
        }

        // Reset to page 1 if we are changing search or filters
        if (key !== "page") params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 border-b border-zinc-800 bg-zinc-900/50">

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search members by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <select
                    onChange={(e) => handleUpdateUrl("status", e.target.value)}
                    defaultValue={searchParams.get("status") || "ALL"}
                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-400 outline-none focus:border-emerald-500 cursor-pointer"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                    onChange={(e) => handleUpdateUrl("tier", e.target.value)}
                    defaultValue={searchParams.get("tier") || "ALL"}
                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-400 outline-none focus:border-emerald-500 cursor-pointer"
                >
                    <option value="ALL">All Tiers</option>
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="VIP">VIP</option>
                </select>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">
                    Page {currentPage} of {Math.max(1, totalPages)}
                </span>
                <button
                    onClick={() => handleUpdateUrl("page", currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => handleUpdateUrl("page", currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 transition-all"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}