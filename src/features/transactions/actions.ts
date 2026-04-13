"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * BI GOAL: Capture revenue events and enrich the Member dimension.
 * Logic: Uses a Database Transaction to ensure financial integrity.
 * Kindness: Revalidates both the Admin Hub and the Member Pass.
 */
export async function logTransaction(memberId: string, amount: number, type: string) {
    try {
        /**
         * ACID COMPLIANCE: 
         * We use $transaction to ensure that the payment record and 
         * the member's total spent increment happen as a single atomic unit.
         */
        const result = await prisma.$transaction([
            // 1. Create the Transaction Fact
            prisma.transaction.create({
                data: {
                    memberId,
                    amount,
                    type
                },
            }),
            // 2. Enrichment: Update the Member's Lifetime Value (LTV)
            prisma.member.update({
                where: { id: memberId },
                data: { totalSpent: { increment: amount } },
            }),
        ]);

        /** * ARCHITECTURE IS KINDNESS: Cache Management
         * 1. Refresh the Admin Dashboard charts (Total Revenue, Revenue Trend).
         * 2. Refresh the student's personal portal pass to show updated history.
         */
        revalidatePath("/");
        revalidatePath(`/portal/${memberId}`);

        // Sanitizing Prisma Decimal/Date objects for the Client Components
        return {
            success: true,
            data: JSON.parse(JSON.stringify(result[0]))
        };
    } catch (error) {
        // Log for Information Assurance audit trails
        console.error("TRANSACTION_LOGGING_ERROR:", error);
        return { error: "System failed to process the payment record securely." };
    }
}