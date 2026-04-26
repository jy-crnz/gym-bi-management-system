/* scripts/migrate-logbook.ts */
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { DateTime } from "luxon";
import { fileURLToPath } from "url";

// 🏛️ THE GOLDEN IMPORT: We use a relative path to your exact app connection
import { prisma } from "../src/lib/prisma";
// We still import the namespace just to use Prisma.Decimal
import { Prisma } from "../src/generated/client/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, "../data/logbook.csv");
const MANILA_ZONE = "Asia/Manila";

// -------------------------
// Helpers
// -------------------------
function normalizeName(name: string) {
    if (!name) return null;
    return name.trim().replace(/\s+/g, " ").toUpperCase();
}

function slugifyName(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, ".");
}

function generateEmail(name: string, usedEmails: Set<string>) {
    const base = `${slugifyName(name)}@lologarry.local`;
    if (!usedEmails.has(base)) {
        usedEmails.add(base);
        return base;
    }
    let i = 2;
    while (usedEmails.has(`${slugifyName(name)}-${i}@lologarry.local`)) {
        i++;
    }
    const email = `${slugifyName(name)}-${i}@lologarry.local`;
    usedEmails.add(email);
    return email;
}

function parseManilaDate(dateStr: string, timeStr: string) {
    if (!dateStr || !timeStr) return null;
    const d = String(dateStr).trim();
    const t = String(timeStr).trim();
    let dt: any = null;

    // 🏛️ THE FIX: Added formats to handle times exactly like "10:10" (no seconds)
    dt = DateTime.fromFormat(`${d} ${t}`, "M/d/yy H:mm", { zone: MANILA_ZONE });
    if (!dt.isValid) dt = DateTime.fromFormat(`${d} ${t}`, "M/d/yy HH:mm:ss", { zone: MANILA_ZONE });
    if (!dt.isValid) dt = DateTime.fromFormat(`${d} ${t}`, "M/d/yyyy H:mm", { zone: MANILA_ZONE });
    if (!dt.isValid) dt = DateTime.fromFormat(`${d} ${t}`, "yyyy-MM-dd H:mm", { zone: MANILA_ZONE });

    if (!dt.isValid) {
        const dateOnly = DateTime.fromISO(d, { zone: MANILA_ZONE });
        if (dateOnly.isValid) {
            const [hh, mm, ss] = t.split(":").map(Number);
            dt = dateOnly.set({ hour: hh || 0, minute: mm || 0, second: ss || 0 });
        }
    }

    if (!dt.isValid) throw new Error(`Cannot parse datetime: ${dateStr} ${timeStr}`);
    return dt.toUTC().toJSDate();
}

function monthKey(dateObj: Date) {
    return DateTime.fromJSDate(dateObj, { zone: MANILA_ZONE }).toFormat("yyyy-MM");
}

function endOfMonthUTC(month: string) {
    const dt = DateTime.fromFormat(month, "yyyy-MM", { zone: MANILA_ZONE })
        .endOf("month")
        .set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
    return dt.toUTC().toJSDate();
}

function readAllRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const rows: any[] = [];
        fs.createReadStream(CSV_PATH)
            .pipe(csv({
                // 🏛️ THE FIX: Strip invisible BOM characters and spaces from headers
                mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
            }))
            .on("data", (row) => rows.push(row))
            .on("end", () => resolve(rows))
            .on("error", reject);
    });
}

// -------------------------
// Main Migration Engine
// -------------------------
async function main() {
    console.log("📂 Loading CSV file...");
    const rows = await readAllRows();
    console.log(`📊 Found ${rows.length} rows to process.`);

    // 🏛️ ADD THESE TWO LINES RIGHT HERE:
    console.log("🕵️ Exact Column Headers:", Object.keys(rows[0]));
    console.log("🕵️ First Row Data:", rows[0]);

    console.log("🔍 Pass 1: Auditing CSV for Member Profiles...");
    const stats = new Map();

    for (const row of rows) {
        const name = normalizeName(row["Name"]);
        const date = row["Date"];
        const time = row["Time in"];
        if (!name || !date || !time) continue;

        const checkIn = parseManilaDate(date, time);
        const month = monthKey(checkIn);

        if (!stats.has(name)) {
            stats.set(name, { visits: 0, months: new Set(), latestVisit: checkIn });
        }
        const member = stats.get(name);
        member.visits += 1;
        member.months.add(month);
        if (checkIn > member.latestVisit) member.latestVisit = checkIn;
    }

    console.log(`Found ${stats.size} unique members.`);

    const usedEmails = new Set<string>();
    const profiles = new Map();
    for (const [name, stat] of stats.entries()) {
        const isMonthly = stat.visits >= 4;
        const email = generateEmail(name, usedEmails);
        let totalSpent = 0;
        let activeUntil = null;

        if (isMonthly) {
            totalSpent = stat.months.size * 450;
            const latestMonth = [...stat.months].sort().pop();
            activeUntil = endOfMonthUTC(latestMonth);
        } else {
            totalSpent = stat.visits * 30;
        }

        profiles.set(name, {
            email,
            passType: isMonthly ? "MONTHLY" : "DAY_PASS",
            status: "ACTIVE",
            totalSpent: new Prisma.Decimal(totalSpent),
            activeUntil,
            chargedMonths: new Set(),
        });
    }

    console.log("📦 Pass 2: Safely importing data to PostgreSQL...");
    const createdAttendanceKeys = new Set();

    for (const row of rows) {
        const name = normalizeName(row["Name"]);
        const date = row["Date"];
        const time = row["Time in"];
        if (!name || !date || !time) continue;

        const profile = profiles.get(name);
        const checkIn = parseManilaDate(date, time);
        const month = monthKey(checkIn);

        const member = await prisma.member.upsert({
            where: { email: profile.email },
            update: {
                name,
                passType: profile.passType,
                status: profile.status,
                activeUntil: profile.activeUntil,
            },
            create: {
                name,
                email: profile.email,
                passType: profile.passType,
                status: profile.status,
                activeUntil: profile.activeUntil,
            },
        });

        const attendanceKey = `${member.id}-${checkIn.toISOString()}`;
        if (!createdAttendanceKeys.has(attendanceKey)) {
            createdAttendanceKeys.add(attendanceKey);
            await prisma.attendance.create({
                data: { memberId: member.id, checkIn },
            });
        }

        if (profile.passType === "DAY_PASS") {
            await prisma.transaction.create({
                data: {
                    memberId: member.id,
                    amount: new Prisma.Decimal(30),
                    type: "Day Pass", // 🏛️ ADDED: Fixed Type Error
                    createdAt: checkIn,
                },
            });
        } else {
            if (!profile.chargedMonths.has(month)) {
                profile.chargedMonths.add(month);
                await prisma.transaction.create({
                    data: {
                        memberId: member.id,
                        amount: new Prisma.Decimal(450),
                        type: "Monthly Renewal", // 🏛️ ADDED: Fixed Type Error
                        createdAt: checkIn,
                    },
                });
            }
        }
    }

    console.log("✅ Migration complete! Your IronBI dashboard is ready.");
}

main()
    .catch((err) => {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });