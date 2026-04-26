"use client";

import { useState } from "react";
import { deleteMember } from "../actions";
import { Trash2, Loader2 } from "lucide-react";

/**
 * 🏛️ ENGINEERING STANDARD: Decommissioning Logic
 * This handles the permanent erasure of a member asset.
 * Responsive Note: w-full on mobile, sm:w-auto on PC to prevent stretching.
 */
export function DeleteMemberButton({ memberId }: { memberId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = confirm(
            "⚠️ CRITICAL WARNING: This operation will permanently erase all attendance records, financial transactions, and BI data for this member. This cannot be undone. Proceed?"
        );

        if (confirmed) {
            setIsDeleting(true);
            try {
                await deleteMember(memberId);
                // The server action handles the redirect back to terminal
            } catch (error) {
                console.error("DELETION_ERROR:", error);
                setIsDeleting(false);
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            /* 🏛️ RESPONSIVE FIX: 
             * w-full: fills the red box on mobile.
             * sm:w-64: prevents the button from stretching to infinity on PC.
             * sm:px-8: adds horizontal breathing room on desktop.
             */
            className="w-full sm:w-64 sm:px-8 py-3.5 border border-red-900/30 text-red-400 text-[10px] font-black uppercase tracking-[0.2em]
                 rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all active:scale-95
                 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 group"
        >
            {isDeleting ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Wiping Data...
                </>
            ) : (
                <>
                    <Trash2 className="w-3.5 h-3.5 group-hover:shake-animation" />
                    Delete Member Profile
                </>
            )}
        </button>
    );
}