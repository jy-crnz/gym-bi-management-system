import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * THE BOUNCER (Next.js 16 Proxy)
 * Architecture is Kindness: We implement "Strict Role Isolation."
 * 1. Guests -> Escorted to correct login gate.
 * 2. Admins -> Restricted to Management Hub.
 * 3. Members -> Restricted to Personal Pass & ID-matched data.
 */
export default withAuth(
    function proxy(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 1. GUEST CHECK (Unauthenticated)
        // Default Deny: If no token exists, nobody gets past this line.
        if (!token) {
            if (path.startsWith("/portal")) {
                return NextResponse.redirect(new URL("/login", req.url));
            }
            return NextResponse.redirect(new URL("/admin", req.url));
        }

        // 2. ADMIN BOUNDARY (The "No Peeking" Rule)
        // Information Assurance: Admins manage the system; they don't use the Member Pass.
        // Prevents an active Admin session from accessing student-facing routes.
        if (token.role === "ADMIN" && path.startsWith("/portal")) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // 3. MEMBER ID SPOOFING PROTECTION
        // Prevents "Identity Harvesting" where Member A tries to view Member B's data.
        if (token.role === "MEMBER" && path.startsWith("/portal/")) {
            const pathSegments = path.split("/");
            const requestedId = pathSegments[2];

            if (token.id !== requestedId) {
                return NextResponse.redirect(new URL(`/portal/${token.id}`, req.url));
            }
        }

        // 4. MEMBER HUB ISOLATION
        // Prevents Members from wandering into the Admin Management area.
        if (token.role === "MEMBER" && (path === "/" || path.startsWith("/admin"))) {
            return NextResponse.redirect(new URL(`/portal/${token.id}`, req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            /**
             * FEATURE: The Master Key
             * We return 'true' here to give our proxy function above 
             * absolute control over the redirection logic.
             */
            authorized: () => true,
        },
    }
);

export const config = {
    /**
     * THE PERIMETER
     * Protects the root and all internal folders.
     * EXCLUDES: gates, auth APIs, and branding assets.
     */
    matcher: [
        "/((?!admin|login|api/auth|_next/static|_next/image|favicon.ico|next.svg|vercel.svg|grid.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};