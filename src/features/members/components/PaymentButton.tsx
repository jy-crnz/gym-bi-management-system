"use client";

import { useState } from "react";
import { logTransaction } from "../../transactions/actions";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet } from "lucide-react";

export function PaymentButton({ memberId }: { memberId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount);

        if (isNaN(numAmount) || numAmount <= 0) return;

        setLoading(true);
        try {
            const result = await logTransaction(memberId, numAmount, "Membership");
            if (result.success) {
                setIsOpen(false);
                setAmount("");
                // Optional: You could trigger a toast notification here
            }
        } catch (error) {
            console.error("PAYMENT_ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* 🏛️ TRIGGER BUTTON */}
            <button
                onClick={() => setIsOpen(true)}
                className="text-[10px] font-bold px-4 py-1.5 rounded-xl transition-all active:scale-95 bg-green-900/20 text-green-400 hover:bg-green-900/40"
            >
                PAY
            </button>

            {/* 🏛️ MODAL OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <Wallet className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-none">Process Payment</h3>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Financial Transaction</p>
                                </div>
                            </div>

                            <form onSubmit={handlePayment} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                        Amount (PHP)
                                    </label>
                                    <input
                                        autoFocus
                                        type="number"
                                        required
                                        min="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="e.g. 1500"
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !amount}
                                    className="w-full bg-emerald-500 text-zinc-950 font-black py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Confirm Payment"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}