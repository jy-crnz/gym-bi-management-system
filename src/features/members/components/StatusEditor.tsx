"use client";

import { useState } from "react";
import { updateMemberStatus } from "../actions";
import { Check, ChevronDown, Loader2 } from "lucide-react";

interface StatusEditorProps {
    memberId: string;
    currentStatus: "ACTIVE" | "INACTIVE" | "CANCELLED";
}

export function StatusEditor({ memberId, currentStatus }: StatusEditorProps) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const statuses = ["ACTIVE", "INACTIVE", "CANCELLED"] as const;

    const handleUpdate = async (status: typeof statuses[number]) => {
        if (status === currentStatus) {
            setIsOpen(false);
            return;
        }
        setIsPending(true);
        await updateMemberStatus(memberId, status);
        setIsPending(false);
        setIsOpen(false);
    };

    const styles = {
        ACTIVE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20",
        INACTIVE: "text-zinc-500 bg-zinc-800 border-zinc-700 hover:bg-zinc-700",
        CANCELLED: "text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
    };

    return (
        <div className="relative inline-block">
            {/* TOGGLE BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black tracking-tight transition-all hover:scale-105 active:scale-95 z-10 relative ${styles[currentStatus]}`}
            >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : currentStatus}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-100" onClick={() => setIsOpen(false)} />

                    {/* 🏛️ THE DROPDOWN:
                        1. Switched back to 'top-full mt-2' (Downward)
                        2. z-[110] (High enough to float over table headers)
                    */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-110 overflow-hidden animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-100 origin-top">
                        <div className="p-1">
                            {statuses.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleUpdate(s)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${s === currentStatus
                                            ? "bg-zinc-800 text-white"
                                            : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                                        }`}
                                >
                                    {s}
                                    {s === currentStatus && <Check className="w-3 h-3 text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}