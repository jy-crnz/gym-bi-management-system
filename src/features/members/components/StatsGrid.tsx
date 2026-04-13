interface StatsProps {
    total: number;
    active: number;
    today: number;
    revenue: number; // New metric for the Financial "Value"
}

export function StatsGrid({ total, active, today, revenue }: StatsProps) {
    const cards = [
        {
            label: "Total Members",
            value: total.toLocaleString(),
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            label: "Active Members",
            value: active.toLocaleString(),
            color: "text-green-600 dark:text-green-400"
        },
        {
            label: "Today's Check-ins",
            value: today.toLocaleString(),
            color: "text-orange-600 dark:text-orange-400"
        },
        {
            label: "Total Revenue",
            value: `₱${revenue.toLocaleString()}`,
            color: "text-emerald-600 dark:text-emerald-400"
        },
    ];

    return (
        /* ARCHITECTURE TIP: 
           Changed to grid-cols-2 on small screens and grid-cols-4 on large screens
           to accommodate the 4th card while following your 8px/16px spacing scale.
        */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md"
                >
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
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