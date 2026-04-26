import { Users } from "lucide-react";

interface CohortData {
    cohort: string;
    total: number;
    m1: number;
    m2: number;
    m3: number;
}

export function CohortMatrix({ data }: { data: CohortData[] }) {
    // 🧠 BI LOGIC: Sort cohorts chronologically instead of alphabetically
    // Converts "Apr 2026" and "Feb 2026" to real dates, then sorts them oldest to newest.
    const sortedData = [...data].sort((a, b) => {
        return new Date(a.cohort).getTime() - new Date(b.cohort).getTime();
    });

    // A "Kindness" function to generate heatmap colors based on retention percentage
    const getHeatmapColor = (percentage: number) => {
        if (percentage === 0) return "bg-zinc-800/50 text-zinc-600";
        if (percentage < 30) return "bg-emerald-500/20 text-emerald-500 font-bold";
        if (percentage < 60) return "bg-emerald-500/40 text-emerald-300 font-bold";
        if (percentage < 80) return "bg-emerald-500/60 text-emerald-100 font-bold";
        return "bg-emerald-500/80 text-white font-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]";
    };

    return (
        /* 🏛️ UI FIX: Standardized to rounded-2xl and hover transitions */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mt-10 shadow-sm transition-all hover:border-zinc-700 w-full">

            {/* 🏛️ RESPONSIVE HEADER: Centered on mobile, aligned left on PC */}
            <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
                <div className="flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-emerald-500 hidden sm:block" />
                        {/* 🏛️ TYPOGRAPHY FIX: Matched the dashboard's italicized headers */}
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight leading-none">
                            Cohort Retention Matrix
                        </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1 sm:mt-0">
                        Percentage of members returning in subsequent 30-day windows.
                    </p>
                </div>
            </div>

            {/* 🏛️ RESPONSIVE TABLE FIX: overflow-x-auto allows swiping on mobile without breaking the layout */}
            <div className="overflow-x-auto p-4 sm:p-6 scrollbar-hide">
                {/* min-w-[600px] ensures the columns never crush below a readable width */}
                <div className="min-w-150">
                    <table className="w-full text-sm text-left border-separate border-spacing-1">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                                <th className="py-2 px-3">Join Month</th>
                                <th className="py-2 px-3 text-center">New Users</th>
                                <th className="py-2 px-3 text-center">Month 1</th>
                                <th className="py-2 px-3 text-center">Month 2</th>
                                <th className="py-2 px-3 text-center">Month 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-zinc-600 text-xs font-medium italic">
                                        Not enough historical data to generate cohorts yet.
                                    </td>
                                </tr>
                            ) : (
                                /* 🏛️ DATA FIX: We are mapping over 'sortedData' instead of the raw 'data' */
                                sortedData.map((row, index) => (
                                    <tr key={index} className="group">
                                        {/* Cohort Name (e.g., "Jan 2026") */}
                                        <td className="py-2.5 px-3 font-bold text-zinc-300 whitespace-nowrap bg-zinc-800/30 rounded-l-md">
                                            {row.cohort}
                                        </td>
                                        {/* Total Users in that cohort */}
                                        <td className="py-2.5 px-3 text-center font-black text-zinc-400 bg-zinc-800/30">
                                            {row.total}
                                        </td>
                                        {/* Month 1 Retention */}
                                        <td className={`py-2.5 px-3 text-center rounded-md transition-colors ${getHeatmapColor(row.m1)}`}>
                                            {row.m1}%
                                        </td>
                                        {/* Month 2 Retention */}
                                        <td className={`py-2.5 px-3 text-center rounded-md transition-colors ${getHeatmapColor(row.m2)}`}>
                                            {row.m2}%
                                        </td>
                                        {/* Month 3 Retention */}
                                        <td className={`py-2.5 px-3 text-center rounded-r-md transition-colors ${getHeatmapColor(row.m3)}`}>
                                            {row.m3}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}