"use client";

import { useState } from "react";
import { logTransaction } from "../../transactions/actions";

export function PaymentButton({ memberId }: { memberId: string }) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        const amount = prompt("Enter payment amount (e.g., 1500):");
        if (!amount || isNaN(Number(amount))) return;

        setLoading(true);
        const result = await logTransaction(memberId, Number(amount), "Membership");

        if (result.success) {
            alert(`Payment of ₱${amount} recorded!`);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="text-[10px] font-bold bg-green-50 text-green-600 px-3 py-1 rounded 
                 hover:bg-green-100 active:scale-95 transition-all ml-2
                 disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400"
        >
            {loading ? "..." : "PAY"}
        </button>
    );
}