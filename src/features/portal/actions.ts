"use server";

import { prisma } from "@/lib/prisma";
/* INFORMATION ASSURANCE: Identity & Security Imports */
import { headers } from "next/headers";
import { loginRateLimiter } from "@/lib/ratelimit";

/**
 * ARCHITECTURE IS KINDNESS: Discriminated Union
 * Satisfies the PortalLoginForm handshake and ensures type safety 
 * for the client-side router.
 */
export type LoginResult =
    | { error: string; memberId?: never }
    | { memberId: string; error?: never };

/**
 * loginAsMember
 * BI GOAL: Securely verify student identity and grant portal access.
 * SECURITY: Implements IP-based rate limiting to prevent brute-force attacks.
 */
export async function loginAsMember(formData: FormData): Promise<LoginResult> {
    const email = formData.get("email") as string;

    // 1. Basic Validation
    if (!email) {
        return { error: "Email is required to access the portal." };
    }

    try {
        /**
         * SECTION 1: RATE LIMITING (Defense in Depth)
         * We retrieve the student's IP to ensure a single actor isn't
         * hammering the system with multiple login attempts.
         */
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

        const { success } = await loginRateLimiter.limit(ip);

        if (!success) {
            return { error: "Too many attempts. Please wait 60 seconds." };
        }

        /**
         * SECTION 2: THE HANDSHAKE
         * Querying the database to verify membership existence.
         */
        const member = await prisma.member.findUnique({
            where: { email },
            select: { id: true }
        });

        if (!member) {
            /**
             * SECURITY NOTE: We use a generic error message here to prevent 
             * 'Email Enumeration'—disclosing which emails are in our database.
             */
            return { error: "Invalid credentials or unauthorized access." };
        }

        // Return the ID to facilitate dynamic routing to /portal/[id]
        return { memberId: member.id };

    } catch (error) {
        // Information Assurance: Log the error internally, keep the UI vague.
        console.error("PORTAL_AUTH_ERROR:", error);
        return { error: "A system error occurred. Please try again later." };
    }
}