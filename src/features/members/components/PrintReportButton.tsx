"use client";

import { Printer } from "lucide-react";

export function PrintReportButton() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors print:hidden"
        >
            <Printer className="w-4 h-4" />
            Print Report
        </button>
    );
}