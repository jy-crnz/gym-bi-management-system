import { prisma } from "@/lib/prisma";

/**
 * ---------------------------------------------------------------------------
 * SECTION 1: DASHBOARD DIRECTORY
 * ---------------------------------------------------------------------------
 */

/**
 * BI GOAL: Retrieve all members for the management dashboard.
 * Snappy Load: We take 10 to keep the initial dashboard load fast.
 */
export async function getMembers() {
    try {
        const members = await prisma.member.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        // Sanitizing: Flattens Prisma objects (Dates/Decimals) into POJOs for Next.js
        return JSON.parse(JSON.stringify(members));
    } catch (error) {
        console.error("QUERY_ERROR (getMembers):", error);
        return [];
    }
}

/**
 * ---------------------------------------------------------------------------
 * SECTION 2: EXECUTIVE KPIS
 * ---------------------------------------------------------------------------
 */

/**
 * BI GOAL: Aggregate metrics for the Executive Dashboard.
 */
export async function getGymStats() {
    try {
        const [totalMembers, activeMembers, todayAttendance, revenueData] = await Promise.all([
            prisma.member.count(),
            prisma.member.count({ where: { status: "ACTIVE" } }),
            prisma.attendance.count({
                where: { checkIn: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true }
            })
        ]);

        return {
            totalMembers,
            activeMembers,
            todayAttendance,
            totalRevenue: Number(revenueData._sum.amount || 0)
        };
    } catch (error) {
        console.error("STATS_ERROR:", error);
        return { totalMembers: 0, activeMembers: 0, todayAttendance: 0, totalRevenue: 0 };
    }
}

/**
 * BI GOAL: Performance vs. Target.
 */
export async function getRevenueGoalProgress() {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: "settings" }
        });
        const target = Number(settings?.revenueGoal || 50000);

        const stats = await getGymStats();
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

/**
 * ---------------------------------------------------------------------------
 * SECTION 3: TREND & BEHAVIOR ANALYTICS
 * ---------------------------------------------------------------------------
 */

/**
 * BI GOAL: Generate Time-Series data for revenue trends.
 */
export async function getRevenueTrend() {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                },
            },
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

/**
 * BI GOAL: Identify gym utilization patterns (Peak Hours).
 */
export async function getPeakHoursData() {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const attendances = await prisma.attendance.findMany({
            where: { checkIn: { gte: todayStart } },
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
 * ---------------------------------------------------------------------------
 * SECTION 4: SEGMENTATION & CHURN
 * ---------------------------------------------------------------------------
 */

/**
 * BI GOAL: Membership Tier Distribution (Segment Analysis).
 */
export async function getMembershipDistribution() {
    try {
        const members = await prisma.member.findMany({ select: { tier: true } });

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

/**
 * BI GOAL: Identify At-Risk Members (Churn Analytics).
 */
export async function getChurnRiskMembers() {
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

/**
 * NEW FEATURE SUPPORT: Helper for Member Login Handshake.
 */
export async function getMemberByEmail(email: string) {
    try {
        const member = await prisma.member.findUnique({
            where: { email },
            select: { id: true }
        });
        return member;
    } catch (error) {
        console.error("GET_BY_EMAIL_ERROR:", error);
        return null;
    }
}

/**
 * BI GOAL: Individual Member Analytics & Portal Pass Data.
 * Includes attendance for the AttendanceCalendar and history for the Pass UI.
 */
export async function getMemberById(id: string) {
    try {
        const member = await prisma.member.findUnique({
            where: { id },
            include: {
                attendance: { orderBy: { checkIn: 'desc' } },
                transactions: { orderBy: { createdAt: 'desc' } },
            },
        });

        // Safety check to avoid serialization errors
        if (!member) return null;

        return JSON.parse(JSON.stringify(member));
    } catch (error) {
        console.error("GET_MEMBER_ERROR:", error);
        return null;
    }
}