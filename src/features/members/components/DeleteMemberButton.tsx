"use client";

import { useState } from "react";
import { deleteMember } from "../actions";

export function DeleteMemberButton({ memberId }: { memberId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = confirm(
            "WARNING: This will permanently remove all attendance and transaction history for this member. Proceed?"
        );

        if (confirmed) {
            setIsDeleting(true);
            await deleteMember(memberId);
            // redirect is handled by the server action
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            /* 🏛️ FIX: Stripped light mode. Locked to border-red-900/30 and text-red-400 */
            className="w-full py-3 border border-red-900/30 text-red-400 text-xs font-bold uppercase tracking-widest
                 rounded-xl hover:bg-red-950/30 hover:border-red-500/50 transition-all
                 disabled:opacity-50 disabled:cursor-wait"
        >
            {isDeleting ? "Wiping Data..." : "Delete Member Profile"}
        </button>
    );
}