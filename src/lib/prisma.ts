// src/lib/prisma.ts
import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * ARCHITECTURE IS KINDNESS:
 * We use a connection pool to manage database traffic efficiently.
 * In Prisma 7, we pass this through the adapter.
 */
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);

// This ensures we only ever have one instance of Prisma running in development
// to prevent "Too many clients" errors in Supabase.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ["query"], // Helpful for debugging your BI queries
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;