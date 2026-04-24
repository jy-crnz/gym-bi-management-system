import { z } from "zod";

/**
 * BI GOAL: Data Quality Governance.
 * This schema acts as the gatekeeper for all member data entering the system.
 */
export const MemberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    status: z.enum(["ACTIVE", "INACTIVE", "CANCELLED"]),

    // 🏛️ NEW: Bakal Gym Business Model Alignment
    // Replaced the old 'tier' system with strict 'passType' categorization.
    passType: z.enum(["DAY_PASS", "MONTHLY"]),
});

/**
 * BI GOAL: Operational Utilization Tracking.
 * Ensures we have a valid member ID before logging a visit.
 */
export const CheckInSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
    location: z.string().optional(),
});

/**
 * BI GOAL: Financial Analytics (Revenue).
 * Coerces the input to a number to prevent "String vs Number" math errors 
 * and strictly forces the payment to be either a Day Pass or a Monthly renewal.
 */
export const TransactionSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    // 🏛️ NEW: Replaced generic "MEMBERSHIP" with exact business offerings
    passType: z.enum(["DAY_PASS", "MONTHLY"]),
});

// TYPE INFERENCE: Keeps your components in sync with your validation logic.
export type TransactionInput = z.infer<typeof TransactionSchema>;
export type MemberInput = z.infer<typeof MemberSchema>;