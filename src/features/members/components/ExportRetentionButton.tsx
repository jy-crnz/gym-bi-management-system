"use client";

import { Download } from "lucide-react";

// 🏛️ INTERFACE ALIGNMENT: Matches the new getRetentionReportData structure
interface AtRiskMember {
    id: string;
    name: string;
    inactivityLabel: string;
    riskLevel: string;
    churnRiskScore: number;
}

export function ExportRetentionButton({ data }: { data: AtRiskMember[] }) {
    const handleExport = () => {
        // 1. Define professional CSV headers
        const headers = ["Member Identity", "Inactivity Status", "Risk Tier", "Churn Probability (%)"];

        // 2. Map the enriched BI data to CSV rows
        const rows = data.map(m => [
            m.name,
            m.inactivityLabel,
            m.riskLevel,
            `${(m.churnRiskScore * 100).toFixed(0)}%`
        ]);

        // 3. Construct the CSV string
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // 4. Standard Browser Download Trigger
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.setAttribute("href", url);
        link.setAttribute("download", `iron-bi-retention-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            /* 🏛️ FIX: Added w-full and whitespace-nowrap */
            className="w-full flex items-center justify-center gap-2 bg-transparent text-zinc-500 px-2 sm:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all active:scale-95 group"
        >
            <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline whitespace-nowrap">
                Export
            </span>
        </button>
    );
}