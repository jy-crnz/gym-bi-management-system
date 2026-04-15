import { LoginForm } from "@/features/auth/components/LoginForm";
import Image from "next/image";
import { Laptop, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    return (
        <main className="relative min-h-screen w-full grid place-items-center bg-zinc-950 overflow-hidden px-6 py-24">

            {/* --- ATMOSPHERIC BACKGROUND --- */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse z-0" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse z-0" />

            {/* --- CENTRAL HUB --- */}
            <div className="relative z-10 w-full max-w-100 mx-auto flex flex-col items-center">

                {/* 1. BRANDING (Keep it here, remove from LoginForm) */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="relative w-32 h-10 mb-8">
                        
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1">
                       
                    </div>

                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
                        SYSTEM ACCESS
                    </h1>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.3em] opacity-60 italic">
                        Log-in to access Dashboard
                    </p>
                </div>

                {/* 2. THE LOGIC HUB */}
                <LoginForm />

                {/* 3. SYSTEM FOOTER */}
                <footer className="mt-20 flex flex-col items-center gap-8 w-full max-w-100">
                    <div className="h-px w-24 bg-linear-to-r from-transparent via-zinc-800 to-transparent" />

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800/50 bg-zinc-900/40 text-zinc-400">
                            <Laptop size={14} strokeWidth={2.5} className="text-blue-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                Device Authorized Terminal
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 opacity-30">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em]">
                                • Admin Portal •
                            </span>
                        </div>
                    </div>
                </footer>
            </div>

            {/* --- GRID OVERLAY --- */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: "url('/grid.svg')",
                    backgroundSize: "40px 40px",
                    WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
                    maskImage: "linear-gradient(to bottom, black, transparent)"
                }}
            />
        </main>
    );
}