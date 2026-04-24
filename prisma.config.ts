import { config } from "dotenv";
import { defineConfig, env } from "@prisma/config";

config();

export default defineConfig({
    schema: "./prisma/schema.prisma",
    // 🏛️ ARCHITECTURE FIX: The official home for the seed command in Prisma v7
    migrations: {
        seed: 'tsx ./prisma/seed.ts',
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});