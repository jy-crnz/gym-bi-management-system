import { TrendingUp, Coins } from "lucide-react";

interface FinancialHealthProps {
    arpu: number;
    cltv: number;
}

export function FinancialHealth({ arpu, cltv }: FinancialHealthProps) {
    // Philippine Peso formatter
    const formatPHP = (value: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

            {/* ARPU Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-1">
                        Avg Revenue Per User (ARPU)
                    </p>
                    <p className="text-2xl font-bold text-white tracking-tight">
                        {formatPHP(arpu)}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* CLTV Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-1">
                        Customer Lifetime Value
                    </p>
                    <p className="text-2xl font-bold text-white tracking-tight">
                        {formatPHP(cltv)}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
            </div>

        </div>
    );
}