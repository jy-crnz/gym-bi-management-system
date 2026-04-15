import { notFound, redirect } from "next/navigation";
import { getMemberById } from "@/features/members/queries";
import { MemberQRCode } from "@/features/members/components/MemberQRCode";
import { AttendanceCalendar } from "@/features/portal/components/AttendanceCalendar";
import { LogoutButton } from "@/features/portal/components/LogoutButton";
import { CancelMembershipButton } from "@/features/members/components/CancelMembershipButton";
import {
    Zap,
    Calendar,
    MapPin,
    Trophy,
    Activity,
    ShieldCheck,
    Fingerprint,
    Info
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

    // 🏛️ STATUS GUARD: Revokes access immediately if status isn't ACTIVE
    if (member.status !== "ACTIVE") {
        redirect("/login?error=membership_inactive");
    }

    const totalVisits = member.attendance.length;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 overflow-x-hidden relative font-sans antialiased">

            {/* ── BACKGROUND ARCHITECTURE ── */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-150 h-150 bg-emerald-500/10 blur-[120px] rounded-full opacity-50" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="max-w-md mx-auto px-6 pt-8 pb-20 relative z-10 space-y-8">

                {/* ── TOP NAV / BRANDING ── */}
                <header className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <Fingerprint className="w-5 h-5 text-zinc-950" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none">IronBI</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Access Terminal</p>
                        </div>
                    </div>
                    <LogoutButton />
                </header>

                {/* ── MAIN DIGITAL ID CARD ── */}
                <section className="relative group isolate"> {/* 🏛️ Added isolate for cleaner sub-pixel rendering */}
                    <div className="absolute -inset-0.5 bg-linear-to-b from-emerald-500/20 to-transparent rounded-[2.5rem] blur-md opacity-75 pointer-events-none" />

                    <div className="
                        relative bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl 
                        overflow-hidden
                        /* 🏛️ THE STABILITY STACK: Prevents dashed/flickering lines */
                        transform-gpu 
                        translate-z-0 
                        backface-visibility-hidden
                        will-change-transform
                    ">
                        {/* Decorative Scanline effect */}
                        <div className="absolute inset-0 bg-linear-to-b from-emerald-500/2 to-transparent pointer-events-none z-0" />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            {/* Member Header */}
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                                    {member.name.split(' ')[0]}<span className="text-emerald-500">.ID</span>
                                </h2>
                                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified Identity</span>
                                </div>
                            </div>

                            {/* QR Focus */}
                            <div className="
                                relative p-4 bg-white rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] 
                                group-hover:scale-[1.02] transition-transform duration-500 
                                /* 🏛️ QR BOX RENDERING FIXES */
                                antialiased 
                                ring-1 ring-inset ring-zinc-200/10
                            ">
                                <MemberQRCode memberId={member.id} name={member.name} />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-950 px-4 py-1 rounded-full border border-zinc-800 shadow-xl">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.3em] whitespace-nowrap">Scan for Entry</p>
                                </div>
                            </div>

                            {/* Card Footer Info */}
                            <div className="grid grid-cols-2 w-full pt-4 gap-4 border-t border-white/5">
                                <div className="text-left">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Membership</p>
                                    <p className={`text-sm font-black italic tracking-tight ${member.tier === 'VIP' ? 'text-amber-400' :
                                        member.tier === 'PREMIUM' ? 'text-blue-400' : 'text-zinc-300'
                                        }`}>
                                        {member.tier} TIER
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Primary Zone</p>
                                    <p className="text-sm font-black text-zinc-300 italic tracking-tight">TUP MANILA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TELEMETRY GRID (Stats) ── */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-3xl relative overflow-hidden group hover:bg-zinc-900/60 transition-colors">
                        <Zap className="absolute -right-2 -top-2 w-12 h-12 text-emerald-500/5 rotate-12" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Account Status</p>
                            <p className="text-xl font-black text-emerald-400 uppercase italic tracking-tighter">Active</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-3xl relative overflow-hidden group hover:bg-zinc-900/60 transition-colors">
                        <Calendar className="absolute -right-2 -top-2 w-12 h-12 text-zinc-500/5 rotate-12" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total visits</p>
                            <p className="text-xl font-black text-zinc-100 uppercase italic tracking-tighter">{totalVisits}</p>
                        </div>
                    </div>
                </section>

                {/* ── ACTIVITY TRACKER ── */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Activity Telemetry</h3>
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
                            Last 6 Months
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-4xl p-4 backdrop-blur-sm overflow-hidden">
                        <AttendanceCalendar attendance={member.attendance} />
                    </div>
                </section>

                {/* ── ACCOUNT DANGER ZONE ── */}
                <footer className="pt-8 space-y-8">
                    <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 flex flex-col items-center gap-4 group/danger transition-colors hover:bg-red-500/8">
                        <div className="flex items-center gap-2 text-red-500/60 group-hover/danger:text-red-500 transition-colors">
                            <Info className="w-3.5 h-3.5" />
                            <p className="text-[9px] font-black uppercase tracking-widest">Self-Service Management</p>
                        </div>
                        <CancelMembershipButton memberId={member.id} />
                    </div>

                    <div className="flex flex-col items-center gap-4 opacity-30">
                        <div className="h-px w-12 bg-zinc-800" />
                        <div className="text-center space-y-1">
                            <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-zinc-500">IronBI Terminal</p>
                            <p className="text-[7px] font-medium text-zinc-600 uppercase tracking-widest">Fly High Coders • Version 1.0.0</p>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
}