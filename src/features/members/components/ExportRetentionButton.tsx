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
            /* 🏛️ FIX: Locked to IronBI Zinc-900 theme and standardized typography */
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all active:scale-95 shadow-sm"
        >
            <Download className="w-3.5 h-3.5" />
            Export CSV
        </button>
    );
}