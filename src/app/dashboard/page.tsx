export default function DashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                Admin Intelligence Dashboard
            </h1>
            <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest font-bold">
                TUP Manila BI System • Live Data Stream
            </p>

            <div className="mt-8 p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center">
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                    Charts & Analytics Loading...
                </span>
            </div>
        </div>
    );
}