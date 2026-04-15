interface StatsProps {
    total: number;
    active: number;
    today: number;
    revenue: number;
}

export function StatsGrid({ total, active, today, revenue }: StatsProps) {
    const cards = [
        {
            label: "Total Members",
            value: total.toLocaleString(),
            /* 🏛️ FIX: Locked to Blue-400 */
            color: "text-blue-400"
        },
        {
            label: "Active Members",
            value: active.toLocaleString(),
            /* 🏛️ FIX: Locked to Green-400 */
            color: "text-green-400"
        },
        {
            label: "Today's Check-ins",
            value: today.toLocaleString(),
            /* 🏛️ FIX: Locked to Orange-400 */
            color: "text-orange-400"
        },
        {
            label: "Total Revenue",
            value: `₱${revenue.toLocaleString()}`,
            /* 🏛️ FIX: Locked to Emerald-400 */
            color: "text-emerald-400"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
            {cards.map((card) => (
                <div
                    key={card.label}
                    /* 🏛️ FIX: Stripped bg-white and dark prefix. Locked to bg-zinc-900 / border-zinc-800 */
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