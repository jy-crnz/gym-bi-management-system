import { config } from "dotenv";
import { defineConfig, env } from "@prisma/config";

config();

export default defineConfig({
    schema: "./prisma/schema.prisma",
    datasource: {
        // This is the new home for your connection URL
        url: env("DATABASE_URL"),
    },
});