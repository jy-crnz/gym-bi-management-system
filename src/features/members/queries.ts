import { prisma } from "@/lib/prisma";

/**
 * 🏛️ ARCHITECTURE IS KINDNESS: The Auto-Sync Engine
 * Upgraded with Information Assurance (System Logging).
 * It now leaves a footprint whenever it intervenes to protect data integrity.
 */
async function syncExpiredMembers() {
    const now = new Date();
    try {
        // 1. 🔍 Identify the anomalies (Active members with expired dates)
        const expiredMembers = await prisma.member.findMany({
            where: {
                status: "ACTIVE",
                activeUntil: { lt: now }
            },
            select: { id: true, name: true }
        });

        // If no one needs fixing, exit quietly.
        if (expiredMembers.length === 0) return;

        // 2. 🛠️ Perform the bulk cleanup
        await prisma.member.updateMany({
            where: {
                id: { in: expiredMembers.map(m => m.id) }
            },
            data: { status: "INACTIVE" }
        });

        // 3. 📜 THE SILENT FOOTPRINT: Log the automated actions
        const logs = expiredMembers.map(member => ({
            action: "SYSTEM_AUTO_DEACTIVATE",
            entityId: member.id,
            details: `SYSTEM ACTION: Automatically deactivated ${member.name} due to pass expiration.`,
            adminName: "IronBI (Automated)" // Distinguishes from human admins
        }));

        await prisma.auditLog.createMany({
            data: logs
        });

    } catch (error) {
        console.error("SYNC_ERROR:", error);
    }
}

/**
 * 🏛️ ARCHITECTURE IS KINDNESS: The Universal Risk Engine
 * This centralized logic ensures the "Truth" about churn risk is consistent 
 * across the entire BI system.
 */
function calculateRisk(activeUntil: string | Date | null): number {
    if (!activeUntil) return 0.95; // No pass = Extreme Risk

    const now = new Date();
    const expiry = new Date(activeUntil);
    const isExpired = expiry < now;

    if (isExpired) {
        const diffTime = Math.abs(now.getTime() - expiry.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        /**
         * 🧠 BI ALGORITHM:
         * Just expired today/yesterday: 70% Risk (Critical window for renewal)
         * Expired > 7 days: 85% Risk (Cold lead)
         * Expired > 14 days: 95% Risk (Likely churned)
         */
        if (diffDays > 14) return 0.95;
        if (diffDays > 7) return 0.85;
        return 0.70;
    }

    // Still active? 5% base risk.
    return 0.05;
}

/**
 * 🏛️ ARCHITECTURE KINDNESS: The Time Engine
 */
function getDateFromRange(range: string): Date | undefined {
    if (range === "all") return undefined;

    const date = new Date();
    switch (range) {
        case "7d":
            date.setDate(date.getDate() - 7);
            break;
        case "30d":
            date.setDate(date.getDate() - 30);
            break;
        case "90d":
            date.setDate(date.getDate() - 90);
            break;
        default:
            date.setDate(date.getDate() - 30);
    }
    return date;
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 1: DASHBOARD DIRECTORY
 * ---------------------------------------------------------------------------
 */

export async function getMembers({
    range = "30d",
    page = 1,
    query = "",
    status,
    passType
}: {
    range?: string;
    page?: number;
    query?: string;
    status?: string;
    passType?: string;
}) {
    // 🏛️ SYNC FIRST: Ensure data integrity before fetching
    await syncExpiredMembers();

    const startDate = getDateFromRange(range);

    const where: any = {};
    if (startDate) where.createdAt = { gte: startDate };
    if (status && status !== "ALL") where.status = status;
    if (passType && passType !== "ALL") where.passType = passType;

    if (query) {
        where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
        ];
    }

    const limit = 5;
    const skip = (page - 1) * limit;

    try {
        const [members, totalCount] = await Promise.all([
            prisma.member.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.member.count({ where })
        ]);

        // 🏛️ ENRICHMENT: Calculate risk for every member in the list
        const enrichedMembers = members.map(member => ({
            ...member,
            churnRiskScore: calculateRisk(member.activeUntil)
        }));

        return {
            data: JSON.parse(JSON.stringify(enrichedMembers)),
            metadata: {
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        };
    } catch (error) {
        console.error("QUERY_ERROR (getMembers):", error);
        return { data: [], metadata: { total: 0, totalPages: 1, currentPage: 1 } };
    }
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 2: EXECUTIVE KPIS & FINANCIALS
 * ---------------------------------------------------------------------------
 */

export async function getGymStats(range: string = "30d") {
    // 🏛️ SYNC FIRST: Ensures KPI accuracy
    await syncExpiredMembers();

    const startDate = getDateFromRange(range);
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    try {
        const totalMembers = await prisma.member.count({ where: dateFilter });
        const activeMembers = await prisma.member.count({
            where: { ...dateFilter, status: "ACTIVE" }
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayAttendance = await prisma.attendance.count({
            where: { checkIn: { gte: todayStart } },
        });

        const revenueData = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: dateFilter
        });

        return {
            totalMembers,
            activeMembers,
            todayAttendance,
            totalRevenue: Number(revenueData._sum?.amount || 0)
        };
    } catch (error) {
        console.error("CRITICAL_STATS_ERROR:", error);
        return { totalMembers: 0, activeMembers: 0, todayAttendance: 0, totalRevenue: 0 };
    }
}

export async function getRevenueGoalProgress(range: string = "30d") {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: "settings" }
        });
        const target = Number(settings?.revenueGoal || 50000);

        const stats = await getGymStats(range);
        const currentRevenue = stats.totalRevenue;
        const percentage = (currentRevenue / target) * 100;

        return {
            current: currentRevenue,
            target: target,
            percentage: Math.min(percentage, 100),
            isGoalReached: currentRevenue >= target
        };
    } catch (error) {
        console.error("GOAL_QUERY_ERROR:", error);
        return { current: 0, target: 50000, percentage: 0, isGoalReached: false };
    }
}

export async function getFinancialHealth(range: string = "30d") {
    const startDate = getDateFromRange(range);
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    try {
        const activeMembersCount = await prisma.member.count({
            where: { ...dateFilter, status: "ACTIVE" }
        });

        const revenueData = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: dateFilter
        });
        const totalRevenue = Number(revenueData._sum?.amount || 0);

        const arpu = activeMembersCount > 0 ? (totalRevenue / activeMembersCount) : 0;
        const estimatedLifespanMonths = 8;
        const cltv = arpu * estimatedLifespanMonths;

        return {
            arpu: Math.round(arpu),
            cltv: Math.round(cltv)
        };
    } catch (error) {
        console.error("FINANCIAL_HEALTH_ERROR:", error);
        return { arpu: 0, cltv: 0 };
    }
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 3: TREND & BEHAVIOR ANALYTICS
 * ---------------------------------------------------------------------------
 */

export async function getRevenueTrend(range: string = "30d") {
    const startDate = getDateFromRange(range);
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    try {
        const transactions = await prisma.transaction.findMany({
            where: dateFilter,
            orderBy: { createdAt: 'asc' },
        });

        const trendMap = new Map();
        transactions.forEach((tx) => {
            const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric'
            });
            const current = trendMap.get(date) || 0;
            trendMap.set(date, current + Number(tx.amount));
        });

        return Array.from(trendMap, ([date, amount]) => ({ date, amount }));
    } catch (error) {
        console.error("TREND_ERROR:", error);
        return [];
    }
}

export async function getPeakHoursData(range: string = "30d") {
    const startDate = getDateFromRange(range);
    const safeStartDate = startDate || new Date(new Date().setDate(new Date().getDate() - 30));

    try {
        const attendances = await prisma.attendance.findMany({
            where: { checkIn: { gte: safeStartDate } },
            select: { checkIn: true },
        });

        const hoursMap = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));

        attendances.forEach((attendance) => {
            // 🏛️ TEMPORAL CALIBRATION: Shift to Manila Time (+8 Hours)
            const manilaTime = new Date(attendance.checkIn.getTime() + (8 * 60 * 60 * 1000));

            // Extract the hour using getUTCHours() so Vercel's local timezone doesn't interfere
            const hour = manilaTime.getUTCHours();

            if (hoursMap[hour]) hoursMap[hour].count++;
        });

        return hoursMap.map((h) => {
            const displayHour = h.hour % 12 || 12;
            const ampm = h.hour >= 12 ? "PM" : "AM";
            return {
                formattedHour: `${displayHour} ${ampm}`,
                count: h.count,
                rawHour: h.hour
            };
        });
    } catch (error) {
        console.error("PEAK_HOURS_ERROR:", error);
        return [];
    }
}

export async function getCohortRetention() {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const members = await prisma.member.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: {
                createdAt: true,
                attendance: { select: { checkIn: true } }
            }
        });

        const cohorts: Record<string, { total: number, m1: number, m2: number, m3: number }> = {};

        members.forEach(member => {
            const joinDate = new Date(member.createdAt);
            const cohortKey = joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            if (!cohorts[cohortKey]) {
                cohorts[cohortKey] = { total: 0, m1: 0, m2: 0, m3: 0 };
            }

            cohorts[cohortKey].total += 1;

            const hasAttendanceInWindow = (startDays: number, endDays: number) => {
                return member.attendance.some(a => {
                    const diffTime = new Date(a.checkIn).getTime() - joinDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays > startDays && diffDays <= endDays;
                });
            };

            if (hasAttendanceInWindow(1, 30)) cohorts[cohortKey].m1 += 1;
            if (hasAttendanceInWindow(31, 60)) cohorts[cohortKey].m2 += 1;
            if (hasAttendanceInWindow(61, 90)) cohorts[cohortKey].m3 += 1;
        });

        return Object.entries(cohorts).map(([cohort, data]) => ({
            cohort,
            total: data.total,
            m1: data.total > 0 ? Math.round((data.m1 / data.total) * 100) : 0,
            m2: data.total > 0 ? Math.round((data.m2 / data.total) * 100) : 0,
            m3: data.total > 0 ? Math.round((data.m3 / data.total) * 100) : 0,
        }));
    } catch (error) {
        console.error("COHORT_ERROR:", error);
        return [];
    }
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 4: SEGMENTATION & CHURN
 * ---------------------------------------------------------------------------
 */

export async function getMembershipDistribution(range: string = "30d") {
    const startDate = getDateFromRange(range);
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    try {
        const members = await prisma.member.findMany({
            where: dateFilter,
            select: { passType: true }
        });

        const distribution = members.reduce((acc: Record<string, number>, member) => {
            acc[member.passType] = (acc[member.passType] || 0) + 1;
            return acc;
        }, {});

        const COLORS = { DAY_PASS: "#94a3b8", MONTHLY: "#3b82f6" };

        return Object.entries(distribution).map(([passType, count]) => ({
            name: passType === "DAY_PASS" ? "Day Pass" : "Monthly",
            value: count,
            fill: COLORS[passType as keyof typeof COLORS] || "#cbd5e1",
        }));
    } catch (error) {
        console.error("DISTRIBUTION_QUERY_ERROR:", error);
        return [];
    }
}

/**
 * 🏛️ BI ENGINE: Proactive Churn & Re-engagement Prediction
 * Updated: Now captures "Recent Expirations" (last 48h) even if status is INACTIVE,
 * alongside "Upcoming Expirations" (next 3 days) for ACTIVE members.
 */
export async function getChurnRiskMembers() {
    try {
        const now = new Date();

        // 1. Define the "Golden Windows"
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

        const atRisk = await prisma.member.findMany({
            where: {
                OR: [
                    // Group A: About to leave (next 3 days)
                    {
                        status: "ACTIVE",
                        activeUntil: { lt: threeDaysFromNow }
                    },
                    // Group B: Recently left (last 48 hours)
                    {
                        status: "INACTIVE",
                        activeUntil: { gte: fortyEightHoursAgo, lt: now }
                    }
                ]
            },
            take: 5,
            orderBy: { activeUntil: 'asc' }
        });

        const formattedMembers = atRisk.map(member => {
            const activeUntil = member.activeUntil ? new Date(member.activeUntil) : new Date();
            const diffTime = activeUntil.getTime() - now.getTime();

            // 🏛️ Same logic used in your report page
            const diffDays = diffTime > 0
                ? Math.floor(diffTime / (1000 * 60 * 60 * 24))
                : Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const isExpired = diffTime < 0;

            let riskStatus = "";
            if (isExpired) {
                // Show "Expired X hours ago" if within today, otherwise "1 Day"
                const absDiffHours = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60));
                if (absDiffHours < 24) {
                    riskStatus = `Expired ${absDiffHours}h ago`;
                } else {
                    riskStatus = `Expired yesterday`;
                }
            } else if (diffDays === 0) {
                riskStatus = "Expires today";
            } else {
                riskStatus = `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
            }

            return {
                ...member,
                daysInactive: isExpired ? 1 : 0,
                isExpired,
                riskStatus,
                churnRiskScore: calculateRisk(member.activeUntil)
            };
        });

        return JSON.parse(JSON.stringify(formattedMembers));
    } catch (error) {
        console.error("CHURN_QUERY_ERROR:", error);
        return [];
    }
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 5: MEMBER PORTAL & DRILL-DOWN
 * ---------------------------------------------------------------------------
 */

export async function getMemberByEmail(email: string) {
    try {
        return await prisma.member.findUnique({
            where: { email },
            select: { id: true }
        });
    } catch (error) {
        console.error("GET_BY_EMAIL_ERROR:", error);
        return null;
    }
}

export async function getMemberById(id: string) {
    try {
        const member = await prisma.member.findUnique({
            where: { id },
            include: {
                attendance: { orderBy: { checkIn: 'desc' } },
                transactions: { orderBy: { createdAt: 'desc' } },
            },
        });

        if (!member) return null;

        return JSON.parse(JSON.stringify({
            ...member,
            churnRiskScore: calculateRisk(member.activeUntil)
        }));
    } catch (error) {
        console.error("GET_MEMBER_ERROR:", error);
        return null;
    }
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 6: ANALYTICS REPORTS
 * ---------------------------------------------------------------------------
 */

/**
 * 🏛️ ANALYTICS ENGINE: Retention Diagnostic Report
 * Fixed: TypeScript 'No overload matches' error by explicitly narrowing null values.
 */
export async function getRetentionReportData() {
    try {
        const now = new Date();

        const members = await prisma.member.findMany({
            where: {
                OR: [
                    { status: "INACTIVE" },
                    { activeUntil: { lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } }
                ]
            },
            orderBy: { activeUntil: 'asc' }
        });

        const reportData = members.map(member => {
            const rawDate = member.activeUntil;

            let isExpired = false;
            let inactivityLabel = "No Active Pass";

            if (rawDate) {
                const activeUntil = new Date(rawDate);
                const diffTime = activeUntil.getTime() - now.getTime();

                isExpired = diffTime < 0;

                if (isExpired) {
                    const absDiffDays = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
                    const displayDays = absDiffDays + 1;
                    inactivityLabel = `${displayDays} Day${displayDays === 1 ? '' : 's'}`;
                } else {
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    inactivityLabel = diffDays === 0
                        ? "0 Days (Expires Today)"
                        : `${diffDays} Day${diffDays === 1 ? '' : 's'}`;
                }
            }

            const score = calculateRisk(member.activeUntil);
            let riskLevel = "LOW RISK";
            if (score >= 0.95) riskLevel = "CHURNED";
            else if (score >= 0.85) riskLevel = "CRITICAL";
            else if (score >= 0.70) riskLevel = "HIGH RISK";

            return {
                id: member.id,
                name: member.name,
                email: member.email, // 🏛️ ADDED: Passing email through for the Contact button
                inactivityLabel,
                riskLevel,
                isExpired,
                churnRiskScore: score
            };
        });

        // 🏛️ Clean serialization for Next.js Server Components
        return JSON.parse(JSON.stringify(reportData));
    } catch (error) {
        console.error("RETENTION_REPORT_QUERY_ERROR:", error);
        return [];
    }
}