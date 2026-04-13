"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle, LockKeyhole, ChevronRight } from "lucide-react";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await signIn("credentials", {
                email,
                password,
                callbackUrl: "/",
                redirect: false,
            });

            if (res?.error) {
                setError(res.error === "CredentialsSignin" ? "Invalid credentials. Access denied." : res.error);
                setIsLoading(false);
            } else if (res?.url) {
                router.refresh();
                router.push("/");
            }
        } catch (err) {
            setError("A system error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-700">
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Input: Terminal ID */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.18em] ml-0.5 block text-left">
                        Terminal ID
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Mail className="w-3.75 h-3.75 text-zinc-600 group-focus-within:text-blue-400 transition-colors duration-200" />
                        </div>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="operator@tup.edu.ph"
                            className="w-full h-11 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/70 transition-all duration-200 placeholder:text-zinc-700 placeholder:italic"
                        />
                    </div>
                </div>

                {/* Input: Access Key */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.18em] ml-0.5 block text-left">
                        Access Key
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Lock className="w-3.75 h-3.75 text-zinc-600 group-focus-within:text-blue-400 transition-colors duration-200" />
                        </div>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full h-11 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/70 transition-all duration-200 placeholder:text-zinc-700"
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/5 border border-red-500/15 rounded-xl animate-in slide-in-from-top-1 duration-300">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none">{error}</p>
                    </div>
                )}

                {/* Submit */}
                <div className="pt-1">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full h-11 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl font-bold uppercase text-[11px] tracking-[0.18em] transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            {isLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    Authenticate
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </form>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                <div className="h-px w-8 bg-zinc-700" />
                <LockKeyhole className="w-2.5 h-2.5 text-zinc-500" />
                <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">
                    End-to-End Encrypted
                </span>
                <div className="h-px w-8 bg-zinc-700" />
            </div>
        </div>
    );
}