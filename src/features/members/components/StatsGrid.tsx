interface StatsProps {
    total: number;
    active: number;
    today: number;
    revenue: number;
    range: string; // 🏛️ NEW: We need to know the active filter
}

export function StatsGrid({ total, active, today, revenue, range }: StatsProps) {
    // 🧠 BI MAPPING: Define how labels change based on the filter
    const rangeLabels: Record<string, string> = {
        today: "Today's",
        yesterday: "Yesterday's",
        "7d": "Weekly",
        "30d": "Monthly",
        "90d": "Quarterly",
        all: "All-Time"
    };

    const periodLabel = rangeLabels[range] || "Period";

    const cards = [
        {
            // 💡 If showing "All Time", it's the Total Club Size. 
            // Otherwise, it's the number of people who joined in that period.
            label: range === "all" ? "Total Members" : `New Members (${periodLabel})`,
            value: total.toLocaleString(),
            color: "text-blue-400"
        },
        {
            label: "Active Members",
            value: active.toLocaleString(),
            color: "text-green-400"
        },
        {
            // 💡 Dynamically changes from "Today's Check-ins" to "Weekly Check-ins", etc.
            label: `${periodLabel} Check-ins`,
            value: today.toLocaleString(),
            color: "text-orange-400"
        },
        {
            label: `${periodLabel} Revenue`,
            value: `₱${revenue.toLocaleString()}`,
            color: "text-emerald-400"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20"
                >
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        {card.label}
                    </p>
                    <p className={`text-2xl font-black ${card.color}`}>
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    );
}