"use client";

import { useState } from "react";
import { updateMemberStatus } from "../actions";
import { AlertTriangle, Loader2 } from "lucide-react";

export function CancelMembershipButton({ memberId }: { memberId: string }) {
    const [step, setStep] = useState<"idle" | "confirm">("idle");
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        setLoading(true);
        await updateMemberStatus(memberId, "CANCELLED");
        setLoading(false);
        setStep("idle");
    };

    if (step === "confirm") {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-xs font-bold uppercase tracking-tight">Confirm Cancellation?</p>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                    This will immediately revoke your access to the gym. This action can only be undone by an administrator.
                </p>
                <div className="flex gap-2">
                    <button
                        disabled={loading}
                        onClick={handleCancel}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Yes, Cancel Membership"}
                    </button>
                    <button
                        disabled={loading}
                        onClick={() => setStep("idle")}
                        className="px-4 py-2 bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase rounded-lg hover:bg-zinc-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setStep("confirm")}
            className="text-zinc-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
        >
            Cancel Membership
        </button>
    );
}