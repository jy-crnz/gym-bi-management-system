"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logTransaction(
    memberId: string,
    amount: number,
    passType: "DAY_PASS" | "MONTHLY"
) {
    try {
        const now = new Date();
        // 🏛️ Initialize new expiration date object
        let newActiveUntil = new Date();

        // 🏛️ DEBUG LOG: Check what passType is actually arriving
        console.log(`Processing ${passType} for member ${memberId}`);

        if (passType === "MONTHLY") {
            // Extension: Today + 30 Days
            newActiveUntil.setDate(now.getDate() + 30);
        } else {
            // Day Pass: Today at 11:59:59 PM
            newActiveUntil.setHours(23, 59, 59, 999);
        }

        const result = await prisma.$transaction([
            prisma.transaction.create({
                data: { memberId, amount, type: passType },
            }),
            prisma.member.update({
                where: { id: memberId },
                data: {
                    totalSpent: { increment: amount },
                    passType: passType,
                    activeUntil: newActiveUntil,
                    status: "ACTIVE" // Reactivate the member automatically
                },
            }),
        ]);

        revalidatePath("/");
        revalidatePath(`/portal/${memberId}`);
        revalidatePath(`/members/${memberId}`);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(result[0]))
        };
    } catch (error) {
        console.error("TRANSACTION_LOGGING_ERROR:", error);
        return { error: "Payment failed to update access date." };
    }
}