import { Users } from "lucide-react";

interface CohortData {
    cohort: string;
    total: number;
    m1: number;
    m2: number;
    m3: number;
}

export function CohortMatrix({ data }: { data: CohortData[] }) {
    // A "Kindness" function to generate heatmap colors based on retention percentage
    const getHeatmapColor = (percentage: number) => {
        if (percentage === 0) return "bg-zinc-800/50 text-zinc-600";
        if (percentage < 30) return "bg-emerald-500/20 text-emerald-500 font-bold";
        if (percentage < 60) return "bg-emerald-500/40 text-emerald-300 font-bold";
        if (percentage < 80) return "bg-emerald-500/60 text-emerald-100 font-bold";
        return "bg-emerald-500/80 text-white font-black shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]";
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mt-10 shadow-lg">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            Cohort Retention Matrix
                        </h3>
                    </div>
                    <p className="text-xs text-zinc-500">
                        Percentage of members returning in subsequent 30-day windows.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto p-6">
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
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-zinc-600 text-xs italic">
                                    Not enough historical data to generate cohorts yet.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={index} className="group">
                                    {/* Cohort Name (e.g., "Apr 2026") */}
                                    <td className="py-2 px-3 font-semibold text-zinc-300 whitespace-nowrap bg-zinc-800/30 rounded-l-md">
                                        {row.cohort}
                                    </td>
                                    {/* Total Users in that cohort */}
                                    <td className="py-2 px-3 text-center font-bold text-zinc-400 bg-zinc-800/30">
                                        {row.total}
                                    </td>
                                    {/* Month 1 Retention */}
                                    <td className={`py-2 px-3 text-center rounded-md transition-colors ${getHeatmapColor(row.m1)}`}>
                                        {row.m1}%
                                    </td>
                                    {/* Month 2 Retention */}
                                    <td className={`py-2 px-3 text-center rounded-md transition-colors ${getHeatmapColor(row.m2)}`}>
                                        {row.m2}%
                                    </td>
                                    {/* Month 3 Retention */}
                                    <td className={`py-2 px-3 text-center rounded-r-md transition-colors ${getHeatmapColor(row.m3)}`}>
                                        {row.m3}%
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}