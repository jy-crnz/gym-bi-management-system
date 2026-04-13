import { z } from "zod";

/**
 * BI GOAL: Data Quality Governance.
 * This schema acts as the gatekeeper for all member data entering the system.
 */
export const MemberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    status: z.enum(["ACTIVE", "INACTIVE", "CANCELLED"]),

    // NEW: Categorization field for BI Segmentation.
    // We omit .default() here to allow useForm to handle the initial state explicitly.
    tier: z.enum(["BASIC", "PREMIUM", "VIP"]),
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
 * when calculating total revenue on the dashboard.
 */
export const TransactionSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    type: z.enum(["MEMBERSHIP", "SUPPLEMENT", "OTHER"]),
});

// TYPE INFERENCE: Keeps your components in sync with your validation logic.
export type TransactionInput = z.infer<typeof TransactionSchema>;
export type MemberInput = z.infer<typeof MemberSchema>;