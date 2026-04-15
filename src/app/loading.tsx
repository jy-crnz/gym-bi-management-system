// src/app/loading.tsx
export default function Loading() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 animate-pulse">
                    Initializing Terminal...
                </p>
            </div>
        </div>
    );
}