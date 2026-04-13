import { notFound } from "next/navigation";
import { getMemberById } from "@/features/members/queries";
import { MemberQRCode } from "@/features/members/components/MemberQRCode";
import { AttendanceCalendar } from "@/features/portal/components/AttendanceCalendar";
import { LogoutButton } from "@/features/portal/components/LogoutButton";
import {
    Zap,
    Calendar,
    MapPin,
    Trophy,
    Activity,
    ShieldCheck
} from "lucide-react";

interface MemberPortalData {
    id: string;
    name: string;
    tier: "BASIC" | "PREMIUM" | "VIP";
    status: string;
    attendance: { checkIn: string }[];
}

export default async function MemberPortalPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const member = await getMemberById(id) as MemberPortalData | null;

    if (!member) return notFound();

    const totalVisits = member.attendance.length;

    return (
        /* THE STAGE: Consistent with the Login Page architecture */
        <div className="min-h-screen bg-zinc-50 dark:bg-[#080808] text-slate-900 dark:text-zinc-100 selection:bg-emerald-500/30 overflow-x-hidden relative">

            {/* ── AMBIENT ARCHITECTURE ── */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-emerald-600/5 blur-[140px] rounded-full pointer-events-none -z-10" />
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('/grid.svg')] bg-center bg-size-[60px_60px] -z-20" />

            <div className="max-w-md mx-auto px-6 pt-10 pb-24 space-y-8 relative z-10">

                {/* ── TOP NAVIGATION ── */}
                <header className="flex justify-between items-end px-1">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">System Online</p>
                        </div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                            {member.name.split(' ')[0]}<span className="text-emerald-500">.Pass</span>
                        </h1>
                    </div>
                    <LogoutButton />
                </header>

                {/* ── IDENTIFICATION SECTION ── */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Identity Verification</span>
                    </div>
                    {/* The QR Code Component is the centerpiece */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-linear-to-r from-emerald-500/20 to-blue-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                        <MemberQRCode memberId={member.id} name={member.name} />
                    </div>
                </section>

                {/* ── STATS GRID ── */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Membership Type</span>
                        </div>
                        <p className={`text-2xl font-black tracking-tighter ${member.tier === 'VIP' ? 'text-amber-500' :
                                member.tier === 'PREMIUM' ? 'text-blue-500' : 'text-zinc-500'
                            }`}>
                            {member.tier}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visits</span>
                        </div>
                        <p className="text-2xl font-black tracking-tighter">
                            {totalVisits}
                        </p>
                    </div>
                </section>

                {/* ── ANALYTICS SECTION ── */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Activity Heatmap</span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-tighter bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">Live Data</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900/30 backdrop-blur-sm rounded-4xl border border-zinc-200 dark:border-zinc-800/50 overflow-hidden shadow-xs">
                        <AttendanceCalendar attendance={member.attendance} />
                    </div>
                </section>

                {/* ── ACTIVE STATUS CARD ── */}
                <section className="relative group">
                    <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-4xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <div className="relative bg-linear-to-br from-emerald-500 to-emerald-700 p-6 rounded-4xl text-white shadow-xl overflow-hidden">
                        <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 opacity-15 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" />

                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Status</p>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Verified Member</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                                        <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin className="w-2.5 h-2.5" /> TUP Manila
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="text-center pt-4 flex flex-col items-center gap-4 opacity-30">
                    <div className="h-px w-8 bg-zinc-300 dark:bg-zinc-800" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-zinc-500">
                        Gym-BI • v2.0
                    </p>
                </footer>

            </div>
        </div>
    );
}