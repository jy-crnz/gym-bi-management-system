"use client";

import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { sendRetentionEmail } from "../actions";

interface ContactButtonProps {
    email: string;
    name: string;
    memberId: string; // 🏛️ ADD THIS
}

export function ContactButton({ email, name, memberId }: ContactButtonProps) {
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        setIsSending(true);
        // ✅ FIXED: Now passing all 3 required arguments
        const result = await sendRetentionEmail(email, name, memberId);

        if (result.success) {
            alert(`Professional re-engagement email sent to ${name}!`);
        } else {
            alert("Failed to send email. Check your Resend API Key.");
        }
        setIsSending(false);
    };

    return (
        <button
            onClick={handleSend}
            disabled={isSending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-black text-blue-500 hover:text-white hover:bg-blue-600 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
        >
            {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
            {isSending ? "Sending..." : "Send AI Invite"}
        </button>
    );
}