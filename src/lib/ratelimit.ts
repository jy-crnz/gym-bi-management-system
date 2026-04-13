import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * INFORMATION ASSURANCE: Auth Rate Limiter
 * * CORE PRINCIPLE: Architecture is kindness.
 * This utility prevents brute-force attacks on the student login portal 
 * by tracking IP-based attempts in a high-performance Redis cache.
 * * SETUP: Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
 */

// 1. Initialize Redis client using environment variables
const redis = Redis.fromEnv();

// 2. Define the Login Limiter
export const loginRateLimiter = new Ratelimit({
    redis: redis,
    /**
     * SLIDING WINDOW: 5 attempts per 60 seconds.
     * This is the "Goldilocks" setting for students: 
     * Strict enough to stop bots, but allows for human typos.
     */
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit/gym-bi",
});

/**
 * FUTURE-PROOFING: You can export additional limiters here
 * e.g., for general API usage or heavy report generation.
 */
// export const apiRateLimiter = new Ratelimit({ ... });