import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
/* INFORMATION ASSURANCE: Identity & Security Imports */
import { headers } from "next/headers";
import { loginRateLimiter } from "@/lib/ratelimit";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                flow: { label: "Flow", type: "text" }
            },
            async authorize(credentials) {
                // ── SECTION 1: RATE LIMITING (Defense in Depth) ──
                const headerList = await headers();
                const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

                // We use a specific prefix to keep Admin and Member lockouts separate in Redis
                const limitKey = `auth_${credentials?.flow || 'admin'}_${ip}`;
                const { success } = await loginRateLimiter.limit(limitKey);

                if (!success) {
                    /**
                     * KINDNESS: Throwing an Error here sends the specific message 
                     * back to your LoginForm's res.error.
                     */
                    throw new Error("Too many attempts. Access locked for 60s.");
                }

                // ── SECTION 2: FLOW A - MEMBER ACCESS ──
                if (credentials?.flow === "member") {
                    const member = await prisma.member.findUnique({
                        where: { email: credentials.email },
                        select: { id: true, name: true, email: true, tier: true }
                    });

                    if (!member) return null;

                    return {
                        id: member.id,
                        email: member.email,
                        name: member.name,
                        role: "MEMBER",
                        tier: member.tier
                    };
                }

                // ── SECTION 3: FLOW B - ADMIN ACCESS ──
                const adminUser = {
                    id: "admin-01",
                    email: "admin@tup.edu.ph",
                    password: "password123", // Architecture Note: Move to .env for production!
                    name: "Jay Lawrence (Admin)",
                    role: "ADMIN"
                };

                if (
                    credentials?.email === adminUser.email &&
                    credentials?.password === adminUser.password
                ) {
                    return adminUser;
                }

                return null;
            }
        })
    ],
    pages: {
        signIn: "/admin",
        error: "/admin",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.tier = (user as any).tier;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).tier = token.tier;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };