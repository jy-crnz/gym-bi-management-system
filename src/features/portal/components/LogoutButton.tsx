"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

/**
 * ARCHITECTURE KINDNESS: Atomic Logout Handler
 * Uses NextAuth to destroy the session and redirect to the member gate.
 */
export function LogoutButton() {
    const [isExiting, setIsExiting] = useState(false);

    const handleLogout = async () => {
        setIsExiting(true);
        // Destroys session and returns user to the member login page
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isExiting}
            /* 🏛️ FIX: Stripped bg-white and dark: classes. Locked to bg-zinc-900 */
            className={`p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 ${isExiting ? "animate-pulse" : ""
                }`}
        >
            <LogOut className={`w-4 h-4 transition-transform ${isExiting ? "scale-75" : ""}`} />
        </button>
    );
}