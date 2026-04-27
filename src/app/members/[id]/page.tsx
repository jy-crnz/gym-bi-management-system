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
    passType: "DAY_PASS" | "MONTHLY";
    activeUntil: string | null;
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

    const passStyles = {
        MONTHLY: "border-blue-500/30 shadow-blue-500/5 text-blue-400 bg-blue-950/20",
        DAY_PASS: "border-zinc-800 shadow-none text-zinc-400 bg-zinc-900"
    };

    const statusIndicatorStyles = {
        ACTIVE: "bg-emerald-500 shadow-emerald-500/20 animate-pulse",
        INACTIVE: "bg-yellow-500 shadow-yellow-500/20",
        CANCELLED: "bg-red-500 shadow-red-500/20"
    };

    const expiryDate = member.activeUntil ? new Date(member.activeUntil) : null;
    const isExpired = expiryDate ? expiryDate < new Date() : true;

    return (
        <div className="min-h-screen bg-black font-sans p-4 sm:p-8 selection:bg-emerald-500/30">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">

                {/* ── TOP NAV & ACTIONS ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <Link
                        href="/"
                        className="w-fit flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Terminal
                    </Link>

                    {/* Thumb-friendly Action Bar */}
                    <div className="flex items-center w-full md:w-auto bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/50">
                        <div className="flex-1 md:w-32">
                            <CheckInButton memberId={member.id} />
                        </div>
                        <div className="w-px h-6 bg-zinc-800 mx-1" />
                        <div className="flex-1 md:w-32">
                            <PaymentButton memberId={member.id} />
                        </div>
                    </div>
                </div>

                {/* ── PROFILE HEADER CARD ── */}
                <div className={`relative overflow-hidden bg-zinc-900 border ${(passStyles[member.passType] || passStyles.DAY_PASS).split(' ')[0]} rounded-3xl sm:rounded-4xl p-6 sm:p-8 shadow-2xl`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/20 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-center gap-6 sm:gap-8">

                        {/* 🏛️ CENTERED CONTAINER */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8 w-full sm:w-auto text-center sm:text-left">

                            {/* 1. THE ICON */}
                            <div className="relative shrink-0 mx-auto sm:mx-0">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-800 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-zinc-700 shadow-inner">
                                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-500" />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-zinc-900 shadow-lg ${statusIndicatorStyles[member.status]}`} />
                            </div>

                            {/* 2. THE TEXT CONTENT */}
                            <div className="min-w-0 flex-1 flex flex-col items-center sm:items-start">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                                    {/* Added pr-2 to prevent italic clipping */}
                                    <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase italic truncate pr-2">
                                        {member.name}
                                    </h1>
                                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] ${passStyles[member.passType]}`}>
                                        {member.passType.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-zinc-500">
                                    <p className="flex items-center gap-1.5 text-xs sm:text-sm font-medium truncate">
                                        <Mail className="w-3.5 h-3.5" /> {member.email}
                                    </p>
                                    <p className="hidden sm:block text-zinc-800">•</p>
                                    <div className={`w-fit flex items-center gap-1.5 px-2 py-1 rounded-md border ${isExpired ? 'border-red-900/50 text-red-500 bg-red-500/5' : 'border-emerald-900/50 text-emerald-500 bg-emerald-500/5'}`}>
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                            {isExpired ? 'Expired' : `Ends: ${expiryDate?.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' })}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lifecycle Badge */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800/50">
                            <div className="bg-zinc-800/50 px-4 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-zinc-700/50 text-right">
                                <p className="hidden md:block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Lifecycle</p>
                                <div className="flex items-center gap-2 justify-end">
                                    <div className={`w-1.5 h-1.5 rounded-full ${statusIndicatorStyles[member.status]}`} />
                                    <span className="text-xs sm:text-sm font-black text-white uppercase italic">{member.status}</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                                UID: {member.id.slice(0, 8)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── METRICS GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                    <div className="lg:col-span-3 space-y-6 sm:space-y-8">

                        {/* LTV & Churn Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-800 group">
                                <div className="flex justify-between items-start mb-4 sm:mb-6">
                                    <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-xl">
                                        <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">Revenue Impact</span>
                                </div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Lifetime Value (LTV)</p>
                                <p className="text-3xl sm:text-5xl font-black text-white tracking-tighter transition-transform group-hover:scale-105 origin-left">
                                    ₱{Number(member.totalSpent).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-800 group">
                                <div className="flex justify-between items-start mb-4 sm:mb-6">
                                    <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl">
                                        <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${member.churnRiskScore > 0.5 ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {member.churnRiskScore > 0.5 ? 'High Risk' : 'Healthy'}
                                    </span>
                                </div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Churn Probability</p>
                                <p className={`text-3xl sm:text-5xl font-black tracking-tighter ${member.churnRiskScore > 0.7 ? 'text-red-500' : member.churnRiskScore > 0.3 ? 'text-orange-400' : 'text-white'}`}>
                                    {(member.churnRiskScore * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        {/* Activity & Financial Streams */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                            <section className="space-y-4">
                                <h3 className="text-[10px] px-2 font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-emerald-500" /> Activity Stream
                                </h3>
                                <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-800 divide-y divide-zinc-800/50 overflow-hidden max-h-80 sm:max-h-100 overflow-y-auto custom-scrollbar">
                                    {member.attendance.length === 0 ? (
                                        <p className="p-8 text-sm text-zinc-500 italic text-center">No logs found.</p>
                                    ) : (
                                        member.attendance.map((log) => (
                                            <div key={log.id} className="p-4 sm:p-5 flex justify-between items-center hover:bg-zinc-800/40 transition-all group">
                                                <div className="flex gap-3 sm:gap-4 items-center">
                                                    <div className="w-1 h-6 sm:h-8 bg-emerald-500/20 group-hover:bg-emerald-500 rounded-full transition-all" />
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-bold text-zinc-100">
                                                            {new Date(log.checkIn).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' })}
                                                        </p>
                                                        <p className="text-[8px] sm:text-[9px] text-zinc-500 uppercase font-black tracking-widest">Standard Check-in</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] sm:text-xs font-black text-zinc-500 font-mono">
                                                    {new Date(log.checkIn).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                        timeZone: 'Asia/Manila'
                                                    })}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] px-2 font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-500" /> Financial Flow
                                </h3>
                                <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-800 divide-y divide-zinc-800/50 overflow-hidden max-h-80 sm:max-h-100 overflow-y-auto custom-scrollbar">
                                    {member.transactions.length === 0 ? (
                                        <p className="p-8 text-sm text-zinc-500 italic text-center">No transactions.</p>
                                    ) : (
                                        member.transactions.map((tx) => (
                                            <div key={tx.id} className="p-4 sm:p-5 flex justify-between items-center hover:bg-zinc-800/40 transition-all group">
                                                <div className="flex gap-3 sm:gap-4 items-center">
                                                    <div className="w-1 h-6 sm:h-8 bg-blue-500/20 group-hover:bg-blue-500 rounded-full transition-all" />
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-bold text-zinc-100 uppercase italic">{tx.type.replace('_', ' ')}</p>
                                                        <p className="text-[8px] sm:text-[9px] text-zinc-500 uppercase font-black tracking-widest">
                                                            {new Date(tx.createdAt).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-sm sm:text-lg font-black text-emerald-400 tracking-tighter">+₱{Number(tx.amount).toLocaleString()}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* QR & Insights Sidebar */}
                    <div className="space-y-6 sm:space-y-8">
                        <div className="w-full max-w-sm mx-auto lg:max-w-none group transition-all hover:scale-[1.02]">
                            <MemberQRCode memberId={member.id} name={member.name} />
                        </div>

                        <div className="p-5 sm:p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <Info className="w-3.5 h-3.5 text-blue-400" />
                                </div>
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">BI Observation</p>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-medium">
                                This member&apos;s <span className="text-blue-400 font-bold italic">Value Dimension</span> is based on their <span className="text-zinc-100">{member.passType === 'MONTHLY' ? 'subscription renewal' : 'daily walk-in'}</span> frequency.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER DECOMMISSION ── */}
                <footer className="pt-8 sm:pt-12 border-t border-zinc-800/50">
                    <div className="max-w-4xl mx-auto bg-red-950/10 border border-red-900/20 p-6 sm:p-8 rounded-3xl sm:rounded-4xl flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 group hover:border-red-500/30 transition-all">

                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                            <div className="p-3 sm:p-4 bg-red-500/10 rounded-xl sm:rounded-2xl group-hover:bg-red-500/20 transition-colors">
                                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                            </div>
                            <div className="max-w-sm">
                                <p className="text-base sm:text-lg font-black text-white uppercase italic tracking-tight">
                                    Decommission Profile
                                </p>
                                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                                    Permanent erasure of this asset and linked datasets.
                                    <span className="block sm:inline"> Operation is irreversible.</span>
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto">
                            <DeleteMemberButton memberId={id} />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}