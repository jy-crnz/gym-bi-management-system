"use client";

import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";

export function MemberQRCode({ memberId, name }: { memberId: string; name: string }) {
    return (
        <div className="flex flex-col items-center p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Member Pass</span>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-inner mb-4">
                <QRCodeSVG
                    value={memberId}
                    size={160}
                    level={"H"} // High error correction
                    includeMargin={false}
                />
            </div>

            <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
            <p className="text-[9px] text-zinc-400 uppercase font-medium mt-1">Scan for Fast-Pass Check-in</p>
        </div>
    );
}