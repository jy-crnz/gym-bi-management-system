"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export function SignOutButton() {
    const [isPending, setIsPending] = useState(false);

    const handleSignOut = async () => {
        setIsPending(true);
        // Architecture Note: Redirecting to /admin ensures we can 
        // immediately re-test the login flow.
        await signOut({ callbackUrl: "/admin" });
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-95 disabled:opacity-50 group"
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Terminate Session
            </span>
        </button>
    );
}