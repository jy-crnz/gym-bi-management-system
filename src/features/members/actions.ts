"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MemberSchema, type MemberInput } from "./schemas";
/* 🏛️ INFORMATION ASSURANCE: Security Imports */
import { headers } from "next/headers";
import { loginRateLimiter } from "@/lib/ratelimit";

/**
 * ARCHITECTURE IS KINDNESS: Discriminated Union
 * Satisfies the PortalLoginForm import and ensures type-safe auth handshakes.
 */
export type LoginResult =
    | { error: string; memberId?: never }
    | { memberId: string; error?: never };

/**
 * ---------------------------------------------------------------------------
 * SECTION 1: AUTHENTICATION (Member Portal Handshake)
 * ---------------------------------------------------------------------------
 */

/**
 * STRATEGY: Member Verification with Rate Limiting.
 * IA GOAL: Prevent brute-force and email harvesting.
 */
export async function loginAsMember(formData: FormData): Promise<LoginResult> {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email is required to verify access." };
    }

    try {
        // ── 1. THE RADAR CHECK (Rate Limiting) ──
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

        // Isolate member attempts from admin attempts in Redis
        const { success } = await loginRateLimiter.limit(`member_login_${ip}`);

        if (!success) {
            return { error: "Too many attempts. Please wait 60 seconds." };
        }

        // ── 2. DATA VERIFICATION ──
        const member = await prisma.member.findUnique({
            where: { email },
            select: { id: true }
        });

        if (!member) {
            /**
             * SECURE HANDSHAKE: Generic error prevents "Email Harvesting."
             * We don't confirm if the email exists to protect student privacy.
             */
            return { error: "Invalid credentials. Access denied." };
        }

        return { memberId: member.id };

    } catch (error) {
        console.error("AUTH_QUERY_ERROR:", error);
        return { error: "A system error occurred. Please try again later." };
    }
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 2: MEMBER MANAGEMENT (Admin/Staff Operations)
 * ---------------------------------------------------------------------------
 */

/**
 * STRATEGY: Create a new member with strict validation.
 * BI GOAL: Revalidate the dashboard so charts reflect the new member immediately.
 */
export async function createMember(formData: MemberInput) {
    const validatedFields = MemberSchema.safeParse(formData);

    if (!validatedFields.success) {
        return {
            error: "Validation failed. Please check your inputs.",
            details: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const member = await prisma.member.create({
            data: {
                name: validatedFields.data.name,
                email: validatedFields.data.email,
                status: validatedFields.data.status,
                tier: validatedFields.data.tier,
            },
        });

        // KINDNESS: Update the Home Dashboard and Member List
        revalidatePath("/");
        revalidatePath("/dashboard/members");

        return {
            success: true,
            data: JSON.parse(JSON.stringify(member))
        };
    } catch (error: any) {
        if (error.code === "P2002") {
            return { error: "A member with this email already exists." };
        }
        console.error("DATABASE_ERROR:", error);
        return { error: "An unexpected error occurred." };
    }
}

/**
 * BI GOAL: Track gym utilization.
 * Updates the 'Today's Foot Traffic' chart in real-time.
 */
export async function logAttendance(memberId: string) {
    try {
        const attendance = await prisma.attendance.create({
            data: {
                memberId: memberId,
                location: "Main Floor",
            },
        });

        // KINDNESS: Trigger revalidation for BI visuals and the user's portal
        revalidatePath("/");
        revalidatePath(`/portal/${memberId}`);

        return { success: true, data: JSON.parse(JSON.stringify(attendance)) };
    } catch (error) {
        console.error("ATTENDANCE_ERROR:", error);
        return { error: "Failed to log attendance." };
    }
}

/**
 * BI GOAL: Capture financial "Value" events.
 * Atomic Transaction ensures the Revenue Trend chart stays accurate.
 */
export async function logTransaction(memberId: string, amount: number, type: string) {
    try {
        const result = await prisma.$transaction([
            prisma.transaction.create({
                data: { memberId, amount, type },
            }),
            prisma.member.update({
                where: { id: memberId },
                data: { totalSpent: { increment: amount } },
            }),
        ]);

        // KINDNESS: Refresh charts for Revenue Trend and Goal Progress
        revalidatePath("/");
        revalidatePath(`/portal/${memberId}`);

        return { success: true, data: JSON.parse(JSON.stringify(result[0])) };
    } catch (error) {
        console.error("TRANSACTION_ERROR:", error);
        return { error: "Failed to process payment." };
    }
}

/**
 * IA GOAL: Secure data disposal.
 */
export async function deleteMember(id: string) {
    try {
        await prisma.$transaction([
            prisma.attendance.deleteMany({ where: { memberId: id } }),
            prisma.transaction.deleteMany({ where: { memberId: id } }),
            prisma.member.delete({ where: { id } }),
        ]);

        // We revalidate before redirecting to ensure the list is updated
        revalidatePath("/");
    } catch (error) {
        console.error("DELETE_ERROR:", error);
        return { error: "Failed to delete member data." };
    }

    // ARCHITECTURE NOTE: redirect() must be called outside of try/catch
    redirect("/");
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 3: SYSTEM SETTINGS
 * ---------------------------------------------------------------------------
 */

export async function updateRevenueGoal(newGoal: number) {
    try {
        await prisma.systemSettings.upsert({
            where: { id: "settings" },
            update: { revenueGoal: newGoal },
            create: { id: "settings", revenueGoal: newGoal },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update goal." };
    }
}