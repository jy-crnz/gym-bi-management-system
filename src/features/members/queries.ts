import { prisma } from "@/lib/prisma";

/**
 * ---------------------------------------------------------------------------
 * ARCHITECTURE KINDNESS: The Time Engine
 * ---------------------------------------------------------------------------
 * Translates URL string ranges into secure Date objects for Prisma.
 * This ensures all BI charts sync to the same exact time window.
 */
function getDateFromRange(range: string): Date | undefined {
    if (range === "all") return undefined; // undefined tells Prisma not to filter by date

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
            date.setDate(date.getDate() - 30); // Default fallback
    }
    return date;
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 1: DASHBOARD DIRECTORY
 * ---------------------------------------------------------------------------
 */

/**
 * BI GOAL: Paginated, Filtered, and Searchable Member Directory.
 */
export async function getMembers({
    range = "30d",
    page = 1,
    query = "",
    status,
    tier
}: {
    range?: string;
    page?: number;
    query?: string;
    status?: string;
    tier?: string;
}) {
    // 1. Time Engine Filter
    const startDate = getDateFromRange(range);

    // 2. Build the exact "Where" clause dynamically
    const where: any = {};
    if (startDate) where.createdAt = { gte: startDate };
    if (status && status !== "ALL") where.status = status;
    if (tier && tier !== "ALL") where.tier = tier;
    if (query) {
        where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
        ];
    }

    // 3. Pagination Math
    const limit = 5; // Show 5 members per page to fit nicely in the UI
    const skip = (page - 1) * limit;

    try {
        // Run both queries simultaneously (Count total + Get actual data)
        const [members, totalCount] = await Promise.all([
            prisma.member.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.member.count({ where })
        ]);

        return {
            data: JSON.parse(JSON.stringify(members)),
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
    const startDate = getDateFromRange(range);
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    try {
        const totalMembers = await prisma.member.count({ where: dateFilter }).catch(() => 0);
        const activeMembers = await prisma.member.count({
            where: { ...dateFilter, status: "ACTIVE" }
        }).catch(() => 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayAttendance = await prisma.attendance.count({
            where: { checkIn: { gte: todayStart } },
        }).catch(() => 0);

        const revenueData = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: dateFilter
        }).catch(() => ({ _sum: { amount: 0 } }));

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
                month: 'short',
                day: 'numeric'
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
            const hour = new Date(attendance.checkIn).getHours();
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

/**
 * 🏛️ NEW BI GOAL: Cohort Retention Engine
 * Calculates what percentage of members return 1 month, 2 months, and 3 months after joining.
 */
export async function getCohortRetention() {
    try {
        // Fetch members who joined in the last 6 months to keep the matrix focused
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

        // Group by Cohort (Month Joined)
        const cohorts: Record<string, { total: number, m1: number, m2: number, m3: number }> = {};

        members.forEach(member => {
            const joinDate = new Date(member.createdAt);
            const cohortKey = joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            if (!cohorts[cohortKey]) {
                cohorts[cohortKey] = { total: 0, m1: 0, m2: 0, m3: 0 };
            }

            cohorts[cohortKey].total += 1;

            // Check if they attended in 30-day windows after joining
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

        // Format as percentages for the UI
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
            select: { tier: true }
        });

        const distribution = members.reduce((acc: Record<string, number>, member) => {
            acc[member.tier] = (acc[member.tier] || 0) + 1;
            return acc;
        }, {});

        const COLORS = { BASIC: "#94a3b8", PREMIUM: "#3b82f6", VIP: "#f59e0b" };

        return Object.entries(distribution).map(([tier, count]) => ({
            name: tier,
            value: count,
            fill: COLORS[tier as keyof typeof COLORS] || "#cbd5e1",
        }));
    } catch (error) {
        console.error("DISTRIBUTION_QUERY_ERROR:", error);
        return [];
    }
}

export async function getChurnRiskMembers(range?: string) {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const atRisk = await prisma.member.findMany({
            where: {
                status: "ACTIVE",
                OR: [
                    { attendance: { none: {} } },
                    { attendance: { every: { checkIn: { lt: sevenDaysAgo } } } }
                ]
            },
            take: 5,
            orderBy: { createdAt: 'asc' }
        });

        return JSON.parse(JSON.stringify(atRisk));
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

        return JSON.parse(JSON.stringify(member));
    } catch (error) {
        console.error("GET_MEMBER_ERROR:", error);
        return null;
    }
}