"use client";

import { Printer } from "lucide-react";

/**
 * 🏛️ ENGINEERING STANDARD: UI SYMMETRY
 * Matches the style of Export buttons to maintain visual balance.
 * print:hidden ensures this button doesn't appear on the actual paper.
 */
export function PrintReportButton() {
    const handlePrint = () => window.print();

    return (
        <button
            onClick={handlePrint}
            /* 🏛️ FIX: Added w-full and whitespace-nowrap */
            className="w-full flex items-center justify-center gap-2 bg-transparent text-zinc-500 px-2 sm:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all active:scale-95 group"
        >
            <Printer className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline whitespace-nowrap">
                Print
            </span>
        </button>
    );
}