"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Download } from "lucide-react";
import { useState } from "react";

interface ExportData {
    stats: {
        totalMembers: number;
        activeMembers: number;
        todayAttendance: number;
        totalRevenue: number;
    };
    tiers: { name: string; value: number }[];
}

// 🏛️ Added 'range' prop to help the PDF label its data correctly
export function ExportReportButton({ 
    data, 
    range = "30d" 
}: { 
    data: ExportData; 
    range?: string 
}) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = () => {
        setIsGenerating(true);
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();
        
        // 🏛️ BI CALCULATIONS: Derive ARPU for the report
        const arpu = data.stats.activeMembers > 0 
            ? (data.stats.totalRevenue / data.stats.activeMembers) 
            : 0;

        // 1. HEADER SECTION
        doc.setFontSize(20);
        doc.setTextColor(24, 24, 27);
        doc.text("GYM BI SYSTEM - MONTHLY REPORT", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(113, 113, 122);
        doc.text(`Generated on: ${timestamp}`, 14, 30);
        doc.text(`Reporting Period: ${range === 'all' ? 'All Time' : `Last ${range}`}`, 14, 35);
        doc.text("TUP Manila • BSIT - 3A • Analytics Department", 14, 40);

        // 2. EXECUTIVE SUMMARY TABLE
        doc.setFontSize(14);
        doc.setTextColor(24, 24, 27);
        doc.text("Executive Summary", 14, 55);

        autoTable(doc, {
            startY: 60,
            head: [['Metric', 'Value']],
            body: [
                ['Total Registered Members', data.stats.totalMembers.toString()],
                ['Active Members (Non-Expired)', data.stats.activeMembers.toString()],
                ['Today\'s Foot Traffic', data.stats.todayAttendance.toString()],
                // 🏛️ DYNAMIC LABEL: Avoids "Lifetime" if range is set
                [range === 'all' ? 'Total Lifetime Revenue' : `Total Revenue (${range})`, `PHP ${data.stats.totalRevenue.toLocaleString()}`],
                // 🏛️ NEW METRIC: Adds ARPU to the PDF
                ['Average Revenue Per User (ARPU)', `PHP ${Math.round(arpu).toLocaleString()}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [24, 24, 27] },
        });

        // 3. SEGMENTATION ANALYSIS TABLE
        const finalY = (doc as any).lastAutoTable.finalY || 60;
        doc.setFontSize(14);
        doc.setTextColor(24, 24, 27);
        doc.text("Membership Segmentation", 14, finalY + 15);

        autoTable(doc, {
            startY: finalY + 20,
            // 🏛️ UI UPDATE: Renamed 'Tier Name' to 'Pass Type'
            head: [['Pass Type', 'Member Count', 'Percentage']],
            body: data.tiers.map(t => [
                t.name === "DAY_PASS" ? "Day Pass" : "Monthly", // 🏛️ Clean Labels
                t.value.toString(),
                `${((t.value / (data.stats.totalMembers || 1)) * 100).toFixed(1)}%`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, 
        });

        // 4. FOOTER & PAGE NUMBERING
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Page ${i} of ${pageCount} - Confidential Gym BI Data`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`Gym-Report-${new Date().toISOString().split('T')[0]}.pdf`);
        setIsGenerating(false);
    };

    return (
        <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 transition-all active:scale-95 shadow-sm disabled:opacity-50"
        >
            {isGenerating ? (
                <Download className="w-3.5 h-3.5 animate-bounce" />
            ) : (
                <FileText className="w-3.5 h-3.5" />
            )}
            {isGenerating ? "Generating..." : "Export BI Report"}
        </button>
    );
}