import { PortalLoginForm } from "@/features/portal/components/PortalLoginForm";
import Image from "next/image";

/**
 * Member LoginPage - Grounded Edition
 * Logic: Uses positive translation to shift the form down and fill the bottom "dead space."
 */
export default function MemberLoginPage() {
    return (
        <main className="fixed inset-0 w-screen h-screen bg-[#080808] grid place-items-center p-6 overflow-hidden selection:bg-emerald-500/20">

            {/* ── BACKGROUND ARCHITECTURE ── */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,#080808_100%)]" />

            {/* Emerald Core Glow: Adjusted to follow the downward shift */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-10%] w-150 h-150 bg-emerald-600/5 blur-[140px] rounded-full pointer-events-none -z-10" />

            {/* ── CORNER ACCENTS ── */}
            <div className="absolute top-10 left-10 w-6 h-6 border-l border-t border-zinc-900 pointer-events-none" />
            <div className="absolute top-10 right-10 w-6 h-6 border-r border-t border-zinc-900 pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-6 h-6 border-l border-b border-zinc-900 pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-6 h-6 border-r border-b border-zinc-900 pointer-events-none" />

            {/* ── THE FORM STACK ── */}
            {/* SHIFT FIX: Using translate-y-12 to push the form down and balance the bottom gap */}
            <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center translate-y-40 transition-transform duration-700 ease-out">

                {/* Branding Logo */}
                <div className="mb-10 opacity-20 hover:opacity-60 transition-opacity duration-500">
                    <Image
                        src="/next.svg"
                        alt="TUP Manila"
                        width={75}
                        height={18}
                        className="invert"
                    />
                </div>

                {/* Main Auth Component */}
                <div className="w-full">
                    <PortalLoginForm />
                </div>

                {/* Footer Divider */}
                <div className="mt-12 flex items-center gap-4 opacity-10">
                    <div className="w-6 h-px bg-zinc-700" />
                    <span className="text-[9px] font-bold text-zinc-500 tracking-[0.3em] uppercase">
                        TUP Manila • Secure Access
                    </span>
                    <div className="w-6 h-px bg-zinc-700" />
                </div>
            </div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(ellipse_70%_70%_at_50%_50%,#000_40%,transparent_100%)]" />
        </main>
    );
}