// src/lib/prisma.ts
import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * ARCHITECTURE IS KINDNESS:
 * We use a connection pool (pg.Pool) to manage database traffic efficiently.
 * This ensures the Next.js app securely talks to the Supabase Pooler (Port 6543)
 * without exhausting database connections.
 */
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

// 🏛️ The modern Next.js Singleton pattern
const prismaClientSingleton = () => {
    return new PrismaClient({
        adapter,
        // Optional: Keep "query" active while you are testing the new Cohort Matrix 
        // to see the exact SQL Prisma is writing under the hood.
        log: ["error", "warn"],
    });
};

declare global {
    // eslint-disable-next-line no-var
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// This ensures we only ever have one instance of Prisma running in development
// to prevent "Too many clients" errors in Supabase.
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}