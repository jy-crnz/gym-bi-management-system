import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberById } from "@/features/members/queries";
import { DeleteMemberButton } from "@/features/members/components/DeleteMemberButton";
import { MemberQRCode } from "@/features/members/components/MemberQRCode";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    User,
    Mail,
    ShieldCheck,
    TrendingDown,
    Wallet,
    Info
} from "lucide-react";

/**
 * ARCHITECTURE KINDNESS: Entity Interfaces
 * Ensures strict typing for the serialized Prisma data.
 */
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
    tier: "BASIC" | "PREMIUM" | "VIP";
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
    // 1. Unpack the ID (Next.js 15 Async Params)
    const { id } = await params;

    // 2. Fetch data (casted to our MemberDetail interface)
    const member = await getMemberById(id) as MemberDetail | null;

    if (!member) return notFound();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 transition-colors">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* --- NAVIGATION --- */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* --- PROFILE HEADER --- */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                <User className="w-10 h-10 text-zinc-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                                        {member.name}
                                    </h1>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${member.tier === 'VIP' ? 'bg-amber-100 text-amber-700' :
                                            member.tier === 'PREMIUM' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-500'
                                        }`}>
                                        {member.tier}
                                    </span>
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 text-sm mt-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    {member.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-tighter">
                                {member.status}
                            </span>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                Joined {new Date(member.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- CONTENT GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Stats & History (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* --- BI DRILL-DOWN STATS --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm group">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lifetime Value (LTV)</p>
                                </div>
                                <p className="text-4xl font-black text-slate-900 dark:text-zinc-50 tracking-tighter">
                                    ₱{Number(member.totalSpent).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Churn Risk Score</p>
                                </div>
                                <p className="text-4xl font-black text-slate-900 dark:text-zinc-50 tracking-tighter">
                                    {(member.churnRiskScore * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        {/* --- DATA HISTORY --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Attendance History */}
                            <section className="space-y-4">
                                <h3 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2 px-1">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    Activity History
                                </h3>
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y dark:divide-zinc-800 overflow-hidden shadow-sm max-h-100 overflow-y-auto">
                                    {member.attendance.length === 0 ? (
                                        <p className="p-8 text-sm text-zinc-400 italic text-center">No visits recorded yet.</p>
                                    ) : (
                                        member.attendance.map((log: AttendanceLog) => (
                                            <div key={log.id} className="p-4 flex justify-between items-center text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 dark:text-zinc-100 font-bold">
                                                        {new Date(log.checkIn).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                                                        Checked In
                                                    </span>
                                                </div>
                                                <span className="font-black text-zinc-400">
                                                    {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            {/* Transaction History */}
                            <section className="space-y-4">
                                <h3 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2 px-1">
                                    <CreditCard className="w-4 h-4 text-emerald-500" />
                                    Payment History
                                </h3>
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y dark:divide-zinc-800 overflow-hidden shadow-sm max-h-100 overflow-y-auto">
                                    {member.transactions.length === 0 ? (
                                        <p className="p-8 text-sm text-zinc-400 italic text-center">No payments found.</p>
                                    ) : (
                                        member.transactions.map((tx: TransactionRecord) => (
                                            <div key={tx.id} className="p-4 flex justify-between items-center text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
                                                        {tx.type}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg tracking-tighter">
                                                    +₱{Number(tx.amount).toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Member Pass & Tips (1/3 width) */}
                    <div className="space-y-6">
                        {/* NEW FEATURE: QR Member Pass */}
                        <MemberQRCode memberId={member.id} name={member.name} />

                        {/* Operational Instructions */}
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-3.5 h-3.5 text-blue-500" />
                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    Reception Tip
                                </p>
                            </div>
                            <p className="text-xs text-blue-700/70 dark:text-blue-400/60 leading-relaxed">
                                Members can scan this QR code at the entrance to trigger automatic check-ins. This data fuels the Peak Hours and Churn Analytics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- DANGER ZONE --- */}
                <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
                        System Controls
                    </p>
                    <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-sm font-bold text-red-900 dark:text-red-400">Remove Member Profile</p>
                            <p className="text-xs text-red-700/60 dark:text-red-400/40">This action is permanent and will delete all behavioral and financial data.</p>
                        </div>
                        <DeleteMemberButton memberId={id} />
                    </div>
                </footer>
            </div>
        </div>
    );
}