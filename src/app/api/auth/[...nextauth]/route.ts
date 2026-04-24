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
                // ── SECTION 1: RATE LIMITING ──
                const headerList = await headers();
                const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

                const limitKey = `auth_${credentials?.flow || 'admin'}_${ip}`;
                const { success } = await loginRateLimiter.limit(limitKey);

                if (!success) {
                    throw new Error("Too many attempts. Access locked for 60s.");
                }

                // ── SECTION 2: FLOW A - MEMBER ACCESS ──
                if (credentials?.flow === "member") {
                    const member = await prisma.member.findUnique({
                        where: { email: credentials.email },
                        // 🏛️ FIX: Replaced 'tier' with 'passType' and 'activeUntil'
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            passType: true,
                            activeUntil: true
                        }
                    });

                    if (!member) return null;

                    return {
                        id: member.id,
                        email: member.email,
                        name: member.name,
                        role: "MEMBER",
                        passType: member.passType, // 🏛️ UPDATED
                        activeUntil: member.activeUntil, // 🏛️ NEW
                    };
                }

                // ── SECTION 3: FLOW B - ADMIN ACCESS ──
                const adminUser = {
                    id: "admin-01",
                    email: "admin@tup.edu.ph",
                    password: "password123",
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
                // 🏛️ UPDATED: Store new pass dimension in the JWT
                token.passType = (user as any).passType;
                token.activeUntil = (user as any).activeUntil;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                // 🏛️ UPDATED: Expose to the Frontend (useSession)
                (session.user as any).passType = token.passType;
                (session.user as any).activeUntil = token.activeUntil;
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