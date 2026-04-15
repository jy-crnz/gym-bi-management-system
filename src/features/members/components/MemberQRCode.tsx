"use client";

import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";

export function MemberQRCode({ memberId, name }: { memberId: string; name: string }) {
    return (
        /* 🏛️ FIX: Removed dark:bg-zinc-800 and dark:border-zinc-700 to force pure white card */
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">

            <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Member Pass</span>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-inner mb-4">
                <QRCodeSVG
                    value={memberId}
                    size={160}
                    level={"H"} // High error correction ensures it scans even if slightly blurry
                    includeMargin={false}
                />
            </div>

            {/* 🏛️ FIX: Removed dark:text-white to ensure the name stays visible on the white background */}
            <p className="text-sm font-bold text-slate-900">{name}</p>
            <p className="text-[9px] text-zinc-400 uppercase font-medium mt-1">Scan for Fast-Pass Check-in</p>

        </div>
    );
}