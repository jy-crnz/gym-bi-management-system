import { prisma } from "./prisma";

export async function createAuditEntry(action: string, details: string, entityId?: string) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                details,
                entityId,
                adminName: "Jay Cerniaz (Admin)", // You can link this to your auth later
            },
        });
    } catch (error) {
        console.error("AUDIT_LOG_FAILURE:", error);
    }
}

export async function getRecentAuditLogs(limit = 5) {
    try {
        const logs = await prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        // Ensure dates are parsed correctly for Server Components
        return JSON.parse(JSON.stringify(logs));
    } catch (error) {
        console.error("FAILED_TO_FETCH_AUDIT_LOGS:", error);
        return [];
    }
}

/**
 * 🏛️ SECURITY ENGINE: The Master Ledger Query
 * Supports pagination, text searching, and action filtering.
 */
export async function getPaginatedAuditLogs({
    query = "",
    action = "ALL",
    page = 1,
    limit = 50
}: {
    query?: string;
    action?: string;
    page?: number;
    limit?: number;
}) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // 1. Action Filter
    if (action && action !== "ALL") {
        where.action = { contains: action, mode: "insensitive" };
    }

    // 2. Text Search (Checks details, admin name, and target ID)
    if (query) {
        where.OR = [
            { details: { contains: query, mode: "insensitive" } },
            { adminName: { contains: query, mode: "insensitive" } },
            { entityId: { contains: query, mode: "insensitive" } }
        ];
    }

    try {
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.auditLog.count({ where })
        ]);

        return {
            data: JSON.parse(JSON.stringify(logs)),
            metadata: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    } catch (error) {
        console.error("AUDIT_FETCH_ERROR:", error);
        return { data: [], metadata: { total: 0, totalPages: 1, currentPage: 1 } };
    }
}