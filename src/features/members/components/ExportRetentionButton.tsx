"use client";

import { Download } from "lucide-react";

interface AtRiskMember {
    name: string;
    daysInactive: number;
}

export function ExportRetentionButton({ data }: { data: AtRiskMember[] }) {
    const handleExport = () => {
        // 1. Define CSV headers
        const headers = ["Member Name", "Days Inactive", "Risk Level"];

        // 2. Map data to CSV rows
        const rows = data.map(m => [
            m.name,
            m.daysInactive,
            m.daysInactive > 60 ? "Critical" : "High Risk"
        ]);

        // 3. Combine headers and rows into a single string
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // 4. Create a Blob and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.setAttribute("href", url);
        link.setAttribute("download", `gym-retention-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-black dark:bg-zinc-100 text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity"
        >
            <Download className="w-4 h-4" />
            Export CSV
        </button>
    );
}