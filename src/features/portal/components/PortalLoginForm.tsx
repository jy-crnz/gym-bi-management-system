"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { loginAsMember, type LoginResult } from "../actions";

export function PortalLoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        try {
            const check = await loginAsMember(formData) as LoginResult;

            if (check.error) {
                setError(check.error);
                setIsPending(false);
                return;
            }

            const res = await signIn("credentials", {
                email,
                flow: "member",
                redirect: false,
            });

            if (res?.error) {
                setError("Verification failed. Please try again.");
                setIsPending(false);
            } else {
                router.refresh();
                router.push(`/portal/${check.memberId}`);
            }
        } catch (err) {
            setError("A system error occurred.");
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
                {/* Status chip */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-emerald-500/20 bg-emerald-500/5"
                >
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-500/80 tracking-[0.15em] uppercase">
                        System Online
                    </span>
                </motion.div>

                {/* FIX: nowrap forces single line */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-[2.75rem] font-black leading-[0.9] tracking-[-0.04em] text-white mb-0 whitespace-nowrap"
                >
                    Member <span className="text-emerald-400">Portal</span>
                </motion.h1>
            </div>

            {/* ── FORM ── */}
            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-3"
            >
                {/* Label row */}
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                        Institutional Email
                    </label>
                    <span className="text-[10px] text-zinc-700 font-medium">
                        @tup.edu.ph
                    </span>
                </div>

                {/* Input */}
                <div className={`
                    relative flex items-center rounded-xl border transition-all duration-300
                    ${isFocused
                        ? "border-emerald-500/50 bg-emerald-500/3 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
                        : "border-zinc-800 bg-zinc-900/60"
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
                        placeholder="yourname@tup.edu.ph"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full h-13 bg-transparent px-3 text-[13px] font-medium text-white placeholder:text-zinc-700 outline-none"
                    />
                </div>

                {/* Error */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: -4, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -4, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center gap-2.5 px-3.5 py-3 mt-1 rounded-xl bg-red-500/5 border border-red-500/15">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                <p className="text-[11px] font-semibold text-red-400 tracking-wide">
                                    {error}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FIX: removed the shine div entirely — it was causing the gray bar */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="
                        group relative w-full h-13 mt-2 rounded-xl
                        bg-white text-zinc-950
                        font-bold text-[12px] tracking-widest uppercase
                        transition-all duration-300
                        hover:bg-emerald-400
                        disabled:opacity-40 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2.5
                    "
                >
                    {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            Access Portal
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </>
                    )}
                </button>
            </motion.form>

            {/* ── FOOTER ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="mt-8 pt-6 border-t border-zinc-900"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                        <span className="text-[10px] font-semibold text-zinc-700 tracking-[0.12em] uppercase">
                            Encrypted Session
                        </span>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-800 font-mono">
                        v2.0.1
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}