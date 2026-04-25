"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MemberSchema, type MemberInput } from "./schemas";

/* 🏛️ INFORMATION ASSURANCE: Security & Audit Imports */
import { headers } from "next/headers";
import { loginRateLimiter } from "@/lib/ratelimit";
import { createAuditEntry } from "@/lib/audit";

/* ✉️ ENGAGEMENT ENGINE: Resend Integration */
import { Resend } from "resend";
import { RetentionEmail } from "@/emails/RetentionEmail";

// Initialize the Email Service
// Ensure RESEND_API_KEY is defined in your .env and Vercel settings
const resend = new Resend(process.env.RESEND_API_KEY);

export type LoginResult =
    | { error: string; memberId?: never }
    | { memberId: string; error?: never };

/**
 * 🏛️ TEMPORAL CALIBRATION: The Offset Neutralizer
 * Completely bypasses the node-postgres local time hijack by injecting
 * a reverse-offset shield into the Date object. 
 * This ensures the database physically stores 15:59:59 UTC (Manila Midnight).
 */
function getManilaMidnight(): Date {
    const now = new Date();

    // 1. Shift current time forward by 8 hours to get Manila time
    const manilaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

    // 2. Extract the exact Manila Year, Month, and Day
    const y = manilaTime.getUTCFullYear();
    const m = String(manilaTime.getUTCMonth() + 1).padStart(2, '0');
    const d = String(manilaTime.getUTCDate()).padStart(2, '0');

    // 3. Target: Manila 23:59:59.999 (stored as UTC 15:59:59.999)
    const targetUTC = new Date(`${y}-${m}-${d}T15:59:59.999Z`);

    // 4. 🛡️ THE SHIELD: Neutralize the node-postgres local timezone hijack.
    // We add the server's offset. When the pg driver subtracts the offset later, 
    // it will perfectly cancel out and leave exactly the intended UTC time.
    const serverOffsetMs = targetUTC.getTimezoneOffset() * 60 * 1000;
    const timezoneProofDate = new Date(targetUTC.getTime() + serverOffsetMs);

    return timezoneProofDate;
}

// ---------------------------------------------------------------------------
// SECTION 1: AUTHENTICATION
// ---------------------------------------------------------------------------

export async function loginAsMember(formData: FormData): Promise<LoginResult> {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email is required to verify access." };
    }

    try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

        const { success } = await loginRateLimiter.limit(`member_login_${ip}`);

        if (!success) {
            return { error: "Too many attempts. Please wait 60 seconds." };
        }

        const member = await prisma.member.findUnique({
            where: { email },
            select: { id: true }
        });

        if (!member) {
            return { error: "Invalid credentials. Access denied." };
        }

        return { memberId: member.id };

    } catch (error) {
        console.error("AUTH_QUERY_ERROR:", error);
        return { error: "A system error occurred. Please try again later." };
    }
}

// ---------------------------------------------------------------------------
// SECTION 2: MEMBER MANAGEMENT & ENGAGEMENT
// ---------------------------------------------------------------------------

/**
 * ✉️ ENGAGEMENT ENGINE: Send Designed Retention Email
 * Uses Resend to deliver a React-designed HTML template to at-risk members.
 * Includes an Audit entry to track staff engagement actions.
 */
export async function sendRetentionEmail(email: string, name: string, memberId: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'IronBI Gym <onboarding@resend.dev>',
            to: [email],
            subject: 'Action Required: Your Membership Status',
            react: RetentionEmail({ name }),
        });

        if (error) {
            console.error("RESEND_ERROR:", error);
            return { success: false, error };
        }

        // 🏛️ AUDIT TRAIL: Record that re-engagement was initiated
        await createAuditEntry(
            "MEMBER_CONTACT",
            `Staff initiated re-engagement: Sent designed invite to ${name} (${email}).`,
            memberId
        );

        return { success: true };
    } catch (err) {
        console.error("EMAIL_ACTION_ERROR:", err);
        return { success: false, error: "System failure during email dispatch." };
    }
}

export async function createMember(formData: MemberInput) {
    const validatedFields = MemberSchema.safeParse(formData);

    if (!validatedFields.success) {
        return {
            error: "Validation failed. Please check your inputs.",
            details: validatedFields.error.flatten().fieldErrors,
        };
    }

    // 🏛️ TEMPORAL CALIBRATION: Calculate Expiration
    let activeUntil: Date;
    if (validatedFields.data.passType === "MONTHLY") {
        activeUntil = new Date();
        activeUntil.setDate(activeUntil.getDate() + 30);
    } else {
        activeUntil = getManilaMidnight();
    }

    // BI Logic: Define prices for the initial transaction
    const initialAmount = validatedFields.data.passType === "MONTHLY" ? 450 : 30;

    try {
        /**
         * 🏛️ ATOMIC REGISTRATION: 
         * Wrap both operations in a transaction to prevent "orphan" members.
         */
        const member = await prisma.$transaction(async (tx) => {
            // 1. Create the Member record
            const newMember = await tx.member.create({
                data: {
                    name: validatedFields.data.name,
                    email: validatedFields.data.email,
                    status: validatedFields.data.status,
                    passType: validatedFields.data.passType,
                    activeUntil: activeUntil,
                    totalSpent: initialAmount,
                },
            });

            // 2. Create the initial Transaction record to fuel the LTV metric
            await tx.transaction.create({
                data: {
                    memberId: newMember.id,
                    amount: initialAmount,
                    type: validatedFields.data.passType,
                }
            });

            return newMember;
        });

        // 🏛️ AUDIT TRAIL: Record the dual event
        await createAuditEntry(
            "MEMBER_CREATE",
            `Registered ${member.name} (${member.passType}) and processed initial ₱${initialAmount} payment.`,
            member.id
        );

        revalidatePath("/");
        revalidatePath("/dashboard/members");
        revalidatePath("/reports/retention");

        return {
            success: true,
            data: JSON.parse(JSON.stringify(member))
        };
    } catch (error: any) {
        if (error.code === "P2002") {
            return { error: "A member with this email already exists." };
        }
        console.error("DATABASE_ERROR:", error);
        return { error: "An unexpected error occurred during registration." };
    }
}

export async function updateMemberStatus(
    memberId: string,
    status: "ACTIVE" | "INACTIVE" | "CANCELLED"
) {
    try {
        const member = await prisma.member.update({
            where: { id: memberId },
            data: { status },
            select: { name: true }
        });

        // 🏛️ AUDIT TRAIL: Record status change
        await createAuditEntry(
            "MEMBER_STATUS_CHANGE",
            `Manual status update for ${member.name}: Changed to ${status}`,
            memberId
        );

        revalidatePath("/");
        revalidatePath(`/members/${memberId}`);
        revalidatePath(`/portal/${memberId}`);
        revalidatePath("/reports/retention");

        return { success: true };
    } catch (error) {
        console.error("STATUS_UPDATE_ERROR:", error);
        return { error: "Failed to update membership status." };
    }
}

/**
 * 🏛️ FINANCIAL ENGINE: Process Payment & Renew Pass
 * Automatically extends the pass, records the revenue, and leaves an audit footprint.
 */
export async function processPayment(memberId: string, amount: number, type: "DAY_PASS" | "MONTHLY") {
    try {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            select: { name: true, activeUntil: true }
        });

        if (!member) return { error: "Member not found." };

        // 1. 🕒 TEMPORAL CALIBRATION: Timezone-Aware Expiration
        const now = new Date();
        const currentExpiry = member.activeUntil ? new Date(member.activeUntil) : now;

        let newExpiry: Date;
        if (type === "MONTHLY") {
            const baseDate = currentExpiry > now ? currentExpiry : now;
            newExpiry = new Date(baseDate);
            newExpiry.setDate(newExpiry.getDate() + 30);
        } else {
            newExpiry = getManilaMidnight();
        }

        // 2. 💰 ATOMIC TRANSACTION: Update time AND record money simultaneously
        await prisma.$transaction([
            prisma.member.update({
                where: { id: memberId },
                data: {
                    activeUntil: newExpiry,
                    status: "ACTIVE",
                    passType: type,
                    totalSpent: { increment: amount }
                }
            }),
            prisma.transaction.create({
                data: {
                    memberId: memberId,
                    amount: amount,
                    type: type
                }
            })
        ]);

        // 3. 📜 THE FINANCIAL FOOTPRINT
        await createAuditEntry(
            "FINANCIAL_TRANSACTION",
            `Processed ₱${amount} payment for ${member.name} (${type}). Pass extended to ${newExpiry.toLocaleDateString()}.`,
            memberId
        );

        revalidatePath("/");
        revalidatePath(`/members/${memberId}`);
        revalidatePath("/reports/retention");

        return { success: true };
    } catch (error) {
        console.error("PAYMENT_ERROR:", error);
        return { error: "Failed to process payment and update pass." };
    }
}

/**
 * 🏛️ logAttendance: THE HARDENED BOUNCER
 * Added: Cooldown logic to prevent duplicate check-ins.
 */
export async function logAttendance(memberId: string) {
    try {
        const now = new Date();

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            select: { name: true, status: true, activeUntil: true }
        });

        if (!member) return { error: "Invalid ID. Member not found." };

        const expiryDate = member.activeUntil ? new Date(member.activeUntil) : null;
        const isExpired = expiryDate ? expiryDate < now : true;

        if (member.status !== "ACTIVE" || isExpired) {
            return {
                error: `ACCESS DENIED: ${member.name}'s pass has expired.`,
                code: "EXPIRED"
            };
        }

        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

        const recentCheckIn = await prisma.attendance.findFirst({
            where: {
                memberId: memberId,
                createdAt: { gte: fifteenMinutesAgo }
            }
        });

        if (recentCheckIn) {
            return {
                error: "COOLDOWN: You already checked in recently.",
                code: "COOLDOWN"
            };
        }

        await prisma.attendance.create({
            data: { memberId: memberId, location: "Main Floor" }
        });

        revalidatePath("/");
        revalidatePath(`/members/${memberId}`);

        return { success: true, name: member.name };

    } catch (error) {
        console.error("ATTENDANCE_ERROR:", error);
        return { error: "System error during check-in." };
    }
}

export async function deleteMember(id: string) {
    try {
        const member = await prisma.member.findUnique({
            where: { id },
            select: { name: true }
        });

        if (!member) return { error: "Member not found." };

        await prisma.$transaction([
            prisma.attendance.deleteMany({ where: { memberId: id } }),
            prisma.transaction.deleteMany({ where: { memberId: id } }),
            prisma.member.delete({ where: { id } }),
        ]);

        await createAuditEntry(
            "MEMBER_DELETE",
            `ADMIN ACTION: Permanently wiped member "${member.name}" and all history.`,
            id
        );

        revalidatePath("/");
        revalidatePath("/reports/retention");

    } catch (error) {
        console.error("DELETE_ERROR:", error);
        return { error: "Failed to delete member data." };
    }

    redirect("/");
}

// ---------------------------------------------------------------------------
// SECTION 3: SYSTEM SETTINGS
// ---------------------------------------------------------------------------

export async function updateRevenueGoal(newGoal: number) {
    try {
        await prisma.systemSettings.upsert({
            where: { id: "settings" },
            update: { revenueGoal: newGoal },
            create: { id: "settings", revenueGoal: newGoal },
        });

        await createAuditEntry(
            "SETTINGS_UPDATE",
            `Modified system revenue target to ₱${newGoal.toLocaleString()}`,
            "settings"
        );

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update goal." };
    }
}