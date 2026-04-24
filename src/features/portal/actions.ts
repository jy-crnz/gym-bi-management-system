"use server";

import { prisma } from "@/lib/prisma";
/* INFORMATION ASSURANCE: Identity & Security Imports */
import { headers } from "next/headers";
import { loginRateLimiter } from "@/lib/ratelimit";

export type LoginResult =
    | { error: string; memberId?: never }
    | { memberId: string; error?: never };

export async function loginAsMember(formData: FormData): Promise<LoginResult> {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email is required to access the portal." };
    }

    try {
        // ── SECTION 1: RATE LIMITING ──
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
        const { success } = await loginRateLimiter.limit(`portal_login_${ip}`);

        if (!success) {
            return { error: "Too many attempts. Please wait 60 seconds." };
        }

        // ── SECTION 2: THE HANDSHAKE ──
        const member = await prisma.member.findUnique({
            where: { email },
            select: {
                id: true,
                status: true,
                activeUntil: true
            }
        });

        if (!member) {
            return { error: "Invalid credentials or unauthorized access." };
        }

        /**
         * 🏛️ THE TEMPORAL GATEKEEPER
         * We verify if the current time has surpassed the activeUntil timestamp.
         */
        const now = new Date();
        const expiryDate = member.activeUntil ? new Date(member.activeUntil) : null;

        // If no date exists or date is in the past, they are expired
        const isExpired = expiryDate ? expiryDate < now : true;

        if (member.status !== "ACTIVE" || isExpired) {
            return {
                error: "Your membership has expired or is inactive. Please proceed to the front desk for renewal."
            };
        }

        // SUCCESS: Only return ID if they pass the status AND time checks
        return { memberId: member.id };

    } catch (error) {
        console.error("PORTAL_AUTH_ERROR:", error);
        return { error: "A system error occurred. Please try again later." };
    }
}

export async function getPortalData(memberId: string) {
    try {
        const data = await prisma.member.findUnique({
            where: { id: memberId },
            include: {
                attendance: { orderBy: { checkIn: "desc" }, take: 10 },
                transactions: { orderBy: { createdAt: "desc" }, take: 10 },
            },
        });
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("GET_PORTAL_DATA_ERROR:", error);
        return null;
    }
}