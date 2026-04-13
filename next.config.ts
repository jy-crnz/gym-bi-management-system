import type { NextConfig } from "next";

/**
 * Next.js Configuration - Industry Standard Security Edition
 * Core Principle: Architecture is kindness to my future self.
 */

// Define CSP as a constant for readability
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  /* ── SECURITY HEADERS ── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          }
        ],
      },
    ];
  },

  /* ── OPTIMIZATION ── */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        // KINDNESS: Allows images from your Supabase storage
        hostname: '**.supabase.co',
      },
    ],
  },

  // Next.js 16 / React 19 Optimizations
  experimental: {
    // serverActions: { bodySizeLimit: '2mb' } // Useful if uploading member photos
  }
};

export default nextConfig;