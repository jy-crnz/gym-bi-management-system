"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { loginAsMember, type LoginResult } from "../actions";

export function PortalLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [localError, setLocalError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // 1. Listen for URL errors
    const urlErrorCode = searchParams.get("error");

    /**
     * ARCHITECTURE FIX: The "Active Error" logic.
     * We hide the URL error as soon as the user starts a new attempt (isPending).
     */
    const activeErrorMessage = (urlErrorCode === "membership_inactive" && !localError && !isPending)
        ? "Membership Cancelled/Inactive"
        : localError;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // 🏛️ STEP 1: THE "HARD" URL RESET
        // This clears the ?error=... from the URL instantly without a page reload.
        // This prevents Next-Auth from seeing the old error during the login attempt.
        if (typeof window !== "undefined") {
            window.history.replaceState({}, "", window.location.pathname);
        }

        setIsPending(true);
        setLocalError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        try {
            // ── A. THE RADAR CHECK (Your Server Action) ──
            const check = await loginAsMember(formData) as LoginResult;

            if (check.error) {
                setLocalError(check.error);
                setIsPending(false);
                return;
            }

            // ── B. THE HANDSHAKE (NextAuth) ──
            const res = await signIn("credentials", {
                email,
                flow: "member",
                redirect: false,
                // Hard-coding the callback to be clean
                callbackUrl: `/portal/${check.memberId}`,
            });

            if (res?.error) {
                // If it fails here, it's a real credential failure
                setLocalError("Verification failed. Please try again.");
                setIsPending(false);
            } else {
                // SUCCESS: Force a full navigation to clear all states
                router.refresh();
                window.location.href = `/portal/${check.memberId}`;
            }
        } catch (err) {
            setLocalError("A system error occurred.");
            setIsPending(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
        >
            {/* ── HEADER ── */}
            <div className="mb-8">
                <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                        System Online
                    </span>
                </motion.div>

                <motion.h1
                    className="text-[2.75rem] font-black leading-[0.9] tracking-[-0.05em] text-white mb-0 whitespace-nowrap italic uppercase"
                >
                    Member <span className="text-emerald-400">Portal</span>
                </motion.h1>
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                            Email
                        </label>
                        <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                            Verified Only
                        </span>
                    </div>

                    <div className={`
                        relative flex items-center rounded-2xl border transition-all duration-500
                        ${isFocused
                            ? "border-emerald-500/50 bg-emerald-500/3 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                            : "border-zinc-800 bg-zinc-900/40"
                        }
                    `}>
                        <Mail className={`
                            ml-4 w-4 h-4 shrink-0 transition-colors duration-300
                            ${isFocused ? "text-emerald-400" : "text-zinc-600"}
                        `} />
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="off"
                            placeholder="yourname@email.com"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full h-14 bg-transparent px-3 text-sm font-medium text-white placeholder:text-zinc-700 outline-none"
                        />
                    </div>
                </div>

                {/* Error Display */}
                <AnimatePresence mode="wait">
                    {activeErrorMessage && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/5 border border-red-500/10"
                        >
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-[11px] font-black text-red-500 uppercase tracking-widest leading-none">
                                {activeErrorMessage}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={isPending}
                    className="
                        group relative w-full h-14 mt-2 rounded-2xl
                        bg-white text-zinc-950
                        font-black text-[12px] tracking-[0.2em] uppercase
                        transition-all duration-300 active:scale-[0.98]
                        hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(52,211,153,0.3)]
                        disabled:opacity-40 disabled:cursor-not-allowed
                        flex items-center justify-center gap-3
                    "
                >
                    {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Access Portal
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-10 pt-6 border-t border-zinc-900/50 flex items-center justify-between opacity-30">
                <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-500 tracking-[0.2em] uppercase">
                        Secure Terminal
                    </span>
                </div>
                <span className="text-[10px] font-bold text-zinc-800 font-mono tracking-tighter">
                    v1.0.0
                </span>
            </div>
        </motion.div>
    );
}