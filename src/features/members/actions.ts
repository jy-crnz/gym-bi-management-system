"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MemberSchema, type MemberInput } from "./schemas";

/**
 * ARCHITECTURE IS KINDNESS: Discriminated Union
 * We export this type to satisfy the PortalLoginForm import.
 * This ensures TypeScript knows exactly what to expect from the auth handshake.
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
 * STRATEGY: Member Verification.
 * BI GOAL: Identify the member and return their ID for dynamic routing to /portal/[id].
 */
export async function loginAsMember(formData: FormData): Promise<LoginResult> {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email is required to verify access." };
    }

    try {
        const member = await prisma.member.findUnique({
            where: { email },
            select: { id: true }
        });

        if (!member) {
            return { error: "No member found with that email address." };
        }

        // Return the ID so the client-side router can hit the dynamic route
        return { memberId: member.id };

    } catch (error) {
        console.error("AUTH_QUERY_ERROR:", error);
        return { error: "A system error occurred during verification." };
    }
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 2: MEMBER MANAGEMENT (Admin/Staff Operations)
 * ---------------------------------------------------------------------------
 */

/**
 * STRATEGY: Create a new member with strict validation.
 * BI GOAL: Capture 'Tier' at entry for accurate segmentation analytics.
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

        // Kindness: Update all relevant views after data entry
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
 * Records the "Fact" of a visit to drive the Peak Hours & Attendance charts.
 */
export async function logAttendance(memberId: string) {
    try {
        const attendance = await prisma.attendance.create({
            data: {
                memberId: memberId,
                location: "Main Floor",
            },
        });

        // Revalidate the dashboard and the specific portal pass
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
 * Atomic Transaction: Ensures the payment fact and the member's 
 * lifetime value (LTV) stay perfectly in sync.
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

        revalidatePath("/");
        revalidatePath(`/portal/${memberId}`);

        return { success: true, data: JSON.parse(JSON.stringify(result[0])) };
    } catch (error) {
        console.error("TRANSACTION_ERROR:", error);
        return { error: "Failed to process payment." };
    }
}

/**
 * BI GOAL: Secure data disposal and referential integrity.
 */
export async function deleteMember(id: string) {
    try {
        await prisma.$transaction([
            prisma.attendance.deleteMany({ where: { memberId: id } }),
            prisma.transaction.deleteMany({ where: { memberId: id } }),
            prisma.member.delete({ where: { id } }),
        ]);
    } catch (error) {
        console.error("DELETE_ERROR:", error);
        return { error: "Failed to delete member data." };
    }

    revalidatePath("/");
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