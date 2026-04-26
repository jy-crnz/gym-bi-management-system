"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export function SignOutButton() {
    const [isPending, setIsPending] = useState(false);

    const handleSignOut = async () => {
        setIsPending(true);
        // 🏛️ Architecture Note: Redirecting to /admin ensures we can 
        // immediately re-test the login flow.
        await signOut({ callbackUrl: "/admin" });
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isPending}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-95 disabled:opacity-50 group"
            title="Terminate Session"
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            )}

            {/* 🏛️ RESPONSIVE FIX: Text collapses on mobile to save header space */}
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                {isPending ? "Ending..." : "Terminate Session"}
            </span>
        </button>
    );
}