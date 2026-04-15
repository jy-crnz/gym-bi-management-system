"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { MemberSchema, type MemberInput } from "../schemas";
import { createMember } from "../actions";

export function RegistrationForm() {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    /**
     * ARCHITECTURE TIP: 
     * Providing explicit defaultValues for 'tier' ensures your BI 
     * data starts with a valid segment and avoids "undefined" errors.
     */
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<MemberInput>({
        resolver: zodResolver(MemberSchema),
        defaultValues: {
            name: "",
            email: "",
            status: "ACTIVE",
            tier: "BASIC" // NEW: Default segment for new signups
        },
    });

    /**
     * ENGINEERING STANDARD:
     * The onSubmit function now passes the 'tier' to the Server Action,
     * which drives the Donut Chart distribution.
     */
    const onSubmit: SubmitHandler<MemberInput> = async (data) => {
        setServerError(null);
        setIsSuccess(false);

        const result = await createMember(data);

        if (result.error) {
            setServerError(result.error);
        } else {
            setIsSuccess(true);
            reset(); // Clear form on success to maintain "Kind" UX
        }
    };

    return (
        /* 🏛️ FIX: Locked main container to bg-zinc-900 */
        <div className="max-w-md w-full bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm transition-all hover:shadow-md">

            {/* 🏛️ FIX: Locked text to zinc-100 */}
            <h2 className="text-xl font-bold mb-1 text-zinc-100">
                New Member Registration
            </h2>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium mb-6">
                Capture Customer Dimension
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Field */}
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                        Full Name
                    </label>
                    <input
                        {...register("name")}
                        /* 🏛️ FIX: Locked inputs to bg-zinc-800 / border-zinc-700 */
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white text-sm"
                        placeholder="Juan Dela Cruz"
                        disabled={isSubmitting}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 uppercase italic">{errors.name.message}</p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                        Email Address
                    </label>
                    <input
                        {...register("email")}
                        type="email"
                        /* 🏛️ FIX: Locked inputs to bg-zinc-800 / border-zinc-700 */
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white text-sm"
                        placeholder="juan@example.com"
                        disabled={isSubmitting}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 uppercase italic">{errors.email.message}</p>
                    )}
                </div>

                {/* NEW: Membership Tier Field (BI Segment) */}
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                        Membership Tier
                    </label>
                    <select
                        {...register("tier")}
                        /* 🏛️ FIX: Locked inputs to bg-zinc-800 / border-zinc-700 */
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white text-sm appearance-none cursor-pointer"
                        disabled={isSubmitting}
                    >
                        <option value="BASIC">Basic (₱1,000/mo)</option>
                        <option value="PREMIUM">Premium (₱2,500/mo)</option>
                        <option value="VIP">VIP Elite (₱5,000/mo)</option>
                    </select>
                    <p className="text-[9px] text-zinc-400 mt-1 italic">
                        *This selection updates the Tier Distribution chart.
                    </p>
                    {errors.tier && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 uppercase italic">{errors.tier.message}</p>
                    )}
                </div>

                {/* Feedback Messages */}
                {serverError && (
                    /* 🏛️ FIX: Locked error state to red-900/20 */
                    <div className="p-3 bg-red-900/20 text-red-400 rounded-lg text-[11px] font-bold uppercase border border-red-900/30">
                        {serverError}
                    </div>
                )}
                {isSuccess && (
                    /* 🏛️ FIX: Locked success state to green-900/20 */
                    <div className="p-3 bg-green-900/20 text-green-400 rounded-lg text-[11px] font-bold uppercase border border-green-900/30">
                        Member registered successfully!
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    /* 🏛️ FIX: Locked button to the stark white/zinc-100 high-contrast design */
                    className="w-full bg-zinc-100 text-slate-900 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Processing..." : "Register Member"}
                </button>
            </form>
        </div>
    );
}