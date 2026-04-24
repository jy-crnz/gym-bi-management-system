import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberById } from "@/features/members/queries";
import { DeleteMemberButton } from "@/features/members/components/DeleteMemberButton";
import { MemberQRCode } from "@/features/members/components/MemberQRCode";
import { CheckInButton } from "@/features/members/components/CheckInButton";
import { PaymentButton } from "@/features/members/components/PaymentButton";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    User,
    Mail,
    TrendingDown,
    Wallet,
    Info,
    Activity,
    History,
    Clock
} from "lucide-react";

interface AttendanceLog {
    id: string;
    checkIn: string;
    checkOut: string | null;
}

interface TransactionRecord {
    id: string;
    amount: number;
    type: string;
    createdAt: string;
}

interface MemberDetail {
    id: string;
    name: string;
    email: string;
    status: "ACTIVE" | "INACTIVE" | "CANCELLED";
    passType: "DAY_PASS" | "MONTHLY"; // 🏛️ UPDATED
    activeUntil: string | null; // 🏛️ NEW
    totalSpent: number;
    churnRiskScore: number;
    createdAt: string;
    attendance: AttendanceLog[];
    transactions: TransactionRecord[];
}

export default async function MemberProfile({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const member = await getMemberById(id) as MemberDetail | null;

    if (!member) return notFound();

    // 🏛️ UPDATED: Aesthetic mapping for the new business model
    const passStyles = {
        MONTHLY: "border-blue-500/30 shadow-blue-500/5 text-blue-400 bg-blue-950/20",
        DAY_PASS: "border-zinc-800 shadow-none text-zinc-400 bg-zinc-900"
    };

    const statusIndicatorStyles = {
        ACTIVE: "bg-emerald-500 shadow-emerald-500/20 animate-pulse",
        INACTIVE: "bg-yellow-500 shadow-yellow-500/20",
        CANCELLED: "bg-red-500 shadow-red-500/20"
    };

    // 🏛️ NEW: Expiration Logic for UI
    const expiryDate = member.activeUntil ? new Date(member.activeUntil) : null;
    const isExpired = expiryDate ? expiryDate < new Date() : true;

    return (
        <div className="min-h-screen bg-black font-sans p-8 selection:bg-emerald-500/30">
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Terminal
                    </Link>

                    <div className="flex items-center bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/50 shadow-inner">
                        <CheckInButton memberId={member.id} />
                        <div className="w-px h-4 bg-zinc-800 mx-1" />
                        <PaymentButton memberId={member.id} />
                    </div>
                </div>

                {/* 🏛️ FIXED: Uses passType and fallback safe access to avoid .split() error */}
                <div className={`relative overflow-hidden bg-zinc-900 border ${(passStyles[member.passType] || passStyles.DAY_PASS).split(' ')[0]} rounded-4xl p-8 shadow-2xl`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/20 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex items-center gap-8">
                            <div className="relative">
                                <div className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center border border-zinc-700 shadow-inner overflow-hidden isolate transform-gpu backface-hidden">
                                    <User className="w-12 h-12 text-zinc-500" />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-zinc-900 shadow-lg transition-all duration-500 ${statusIndicatorStyles[member.status]}`} />
                            </div>

                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                                        {member.name}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] ${passStyles[member.passType]}`}>
                                        {member.passType.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-zinc-500">
                                    <p className="flex items-center gap-1.5 text-sm font-medium">
                                        <Mail className="w-4 h-4" /> {member.email}
                                    </p>
                                    <span className="text-zinc-800 hidden md:block">•</span>
                                    <p className="text-[10px] font-bold uppercase tracking-widest">
                                        UID: {member.id.slice(0, 8)}
                                    </p>

                                    {/* 🏛️ NEW BI INDICATOR: Access Expiration */}
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border ${isExpired ? 'border-red-900/50 text-red-500 bg-red-500/5' : 'border-emerald-900/50 text-emerald-500 bg-emerald-500/5'}`}>
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {isExpired ? 'Expired' : `Active Until: ${expiryDate?.toLocaleDateString()}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="bg-zinc-800/50 px-5 py-3 rounded-2xl border border-zinc-700/50 text-right w-full md:w-auto">
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Account Lifecycle</p>
                                <div className="flex items-center gap-2 justify-end">
                                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${statusIndicatorStyles[member.status]}`} />
                                    <span className="text-sm font-black text-white uppercase italic">{member.status}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest px-2">
                                Joined {new Date(member.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-zinc-900 p-8 rounded-4xl border border-zinc-800 shadow-sm transition-all hover:border-emerald-500/30 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                        <Wallet className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">Revenue Impact</span>
                                </div>
                                <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Lifetime Value (LTV)</p>
                                <p className="text-5xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">
                                    ₱{Number(member.totalSpent).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-zinc-900 p-8 rounded-4xl border border-zinc-800 shadow-sm transition-all hover:border-blue-500/30 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                                        <TrendingDown className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${member.churnRiskScore > 0.5 ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {member.churnRiskScore > 0.5 ? 'High Risk' : 'Healthy'}
                                    </span>
                                </div>
                                <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Churn Probability</p>
                                <p className={`text-5xl font-black tracking-tighter transition-transform origin-left ${member.churnRiskScore > 0.7 ? 'text-red-500' :
                                    member.churnRiskScore > 0.3 ? 'text-orange-400' : 'text-white'
                                    }`}>
                                    {(member.churnRiskScore * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                        Activity Stream
                                    </h3>
                                    <History className="w-4 h-4 text-zinc-700" />
                                </div>
                                <div className="bg-zinc-900 rounded-3xl border border-zinc-800 divide-y divide-zinc-800/50 overflow-hidden shadow-sm max-h-100 overflow-y-auto custom-scrollbar">
                                    {member.attendance.length === 0 ? (
                                        <p className="p-8 text-sm text-zinc-500 italic text-center">No attendance recorded.</p>
                                    ) : (
                                        member.attendance.map((log: AttendanceLog) => (
                                            <div key={log.id} className="p-5 flex justify-between items-center hover:bg-zinc-800/40 transition-all group">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-1 h-8 bg-emerald-500/20 group-hover:bg-emerald-500 rounded-full transition-all" />
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-100">{new Date(log.checkIn).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Standard Check-in</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-zinc-500 font-mono">{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        Financial Flow
                                    </h3>
                                    <History className="w-4 h-4 text-zinc-700" />
                                </div>
                                <div className="bg-zinc-900 rounded-3xl border border-zinc-800 divide-y divide-zinc-800/50 overflow-hidden shadow-sm max-h-100 overflow-y-auto custom-scrollbar">
                                    {member.transactions.length === 0 ? (
                                        <p className="p-8 text-sm text-zinc-500 italic text-center">No transactions recorded.</p>
                                    ) : (
                                        member.transactions.map((tx: TransactionRecord) => (
                                            <div key={tx.id} className="p-5 flex justify-between items-center hover:bg-zinc-800/40 transition-all group">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-1 h-8 bg-blue-500/20 group-hover:bg-blue-500 rounded-full transition-all" />
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-100 uppercase italic">{tx.type.replace('_', ' ')}</p>
                                                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-black text-emerald-400 tracking-tighter">+₱{Number(tx.amount).toLocaleString()}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="group transition-all hover:scale-[1.02]">
                            <MemberQRCode memberId={member.id} name={member.name} />
                        </div>

                        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-4xl relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <Info className="w-4 h-4 text-blue-400" />
                                </div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">BI Observation</p>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                This member&apos;s <span className="text-blue-400 font-bold italic">Value Dimension</span> is based on their <span className="text-zinc-100">{member.passType === 'MONTHLY' ? 'subscription renewal' : 'daily walk-in'}</span> frequency.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="pt-12 border-t border-zinc-800/50">
                    <div className="bg-red-950/10 border border-red-900/20 p-8 rounded-4xl flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-red-500/30 transition-all">
                        <div className="flex items-center gap-6 text-center md:text-left">
                            <div className="p-4 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors">
                                <TrendingDown className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-white uppercase italic tracking-tight">Decommission Profile</p>
                                <p className="text-sm text-zinc-500 max-w-sm">Permanent erasure of this asset and all linked financial/behavioral datasets. This operation cannot be reversed.</p>
                            </div>
                        </div>
                        <DeleteMemberButton memberId={id} />
                    </div>
                </footer>
            </div>
        </div>
    );
}