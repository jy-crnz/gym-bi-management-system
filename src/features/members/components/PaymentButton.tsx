"use client";

import { useState } from "react";
// 🏛️ ARCHITECTURE UPDATE: Pointing to our new engine with Audit Logging
import { processPayment } from "../actions";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CheckCircle2 } from "lucide-react";

export function PaymentButton({ memberId }: { memberId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // 🏛️ NEW: State to track which pass is being purchased
    const [passType, setPassType] = useState<"DAY_PASS" | "MONTHLY">("DAY_PASS");

    // BI Logic: Map the type to the actual price
    const amount = passType === "MONTHLY" ? 450 : 30;

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 🏛️ THE CONNECTION: Now calling the function that updates time, money, and logs it.
            const result = await processPayment(memberId, amount, passType);

            if (result?.error) {
                alert(result.error); // Shows any server rejection
            } else if (result?.success) {
                setIsOpen(false);
            }
        } catch (error) {
            console.error("PAYMENT_ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-[10px] font-black px-4 py-1.5 rounded-xl transition-all active:scale-95 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-zinc-950 uppercase tracking-widest"
            >
                PAY
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 rounded-full pointer-events-none" />

                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <Wallet className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight leading-none">Process Payment</h3>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Financial Transaction</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* PRODUCT SELECTION GRID */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        Select Access Package
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPassType("DAY_PASS")}
                                            className={`p-4 rounded-2xl border transition-all text-left ${passType === "DAY_PASS"
                                                ? 'border-emerald-500 bg-emerald-500/5'
                                                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                                }`}
                                        >
                                            <p className={`text-[9px] font-black uppercase mb-1 ${passType === "DAY_PASS" ? 'text-emerald-500' : 'text-zinc-600'}`}>Quick Entry</p>
                                            <p className="text-xl font-black text-white italic">₱30</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Day Pass</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPassType("MONTHLY")}
                                            className={`p-4 rounded-2xl border transition-all text-left ${passType === "MONTHLY"
                                                ? 'border-blue-500 bg-blue-500/5'
                                                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                                }`}
                                        >
                                            <p className={`text-[9px] font-black uppercase mb-1 ${passType === "MONTHLY" ? 'text-blue-500' : 'text-zinc-600'}`}>Full Access</p>
                                            <p className="text-xl font-black text-white italic">₱450</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Monthly</p>
                                        </button>
                                    </div>
                                </div>

                                {/* TOTAL SUMMARY */}
                                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center shadow-inner">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Immediate Billing</span>
                                    <span className="text-3xl font-black text-white tracking-tighter italic">₱{amount}</span>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full bg-zinc-100 text-zinc-950 font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-white active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        "Syncing Ledger..."
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Confirm Transaction
                                        </>
                                    )}
                                </button>

                                <p className="text-[9px] text-zinc-600 text-center uppercase font-bold tracking-widest">
                                    Funds will be credited to gym operational revenue.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}