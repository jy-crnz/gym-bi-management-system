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
            className="w-full mt-12 py-3 border border-red-200 dark:border-red-900/30 
                 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest
                 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all
                 disabled:opacity-50 disabled:cursor-wait"
        >
            {isDeleting ? "Wiping Data..." : "Delete Member Profile"}
        </button>
    );
}