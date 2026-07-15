import type { NextConfig } from "next";
import os from "os";

const isDev = process.env.NODE_ENV !== "production";

function csp(frameAncestors: string): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdnjs.cloudflare.com https://identity.netlify.com https://app.netlify.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com https://app.netlify.com",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://images.unsplash.com https://unpkg.com https://app.netlify.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.netlify.app https://identity.netlify.com https://app.netlify.com",
    "frame-src 'self' https://*.netlify.app https://app.netlify.com https://www.google.com",
    `frame-ancestors ${frameAncestors}`,
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

const sharedHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(!isDev
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

function getDevOrigins(): string[] {
  const origins = ["localhost", "127.0.0.1", "[::1]"];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        origins.push(iface.address);
      }
    }
  }
  if (process.env.ALLOWED_DEV_ORIGINS) {
    origins.push(...process.env.ALLOWED_DEV_ORIGINS.split(","));
  }
  return origins;
}

const nextConfig: NextConfig = {
  // PPR hanya di production — dev triggers HMR reload loop via proxy component
  // generation yang gak bisa di-handle Turbopack dengan baik.
  cacheComponents: !isDev,
  experimental: {
    // useCache pisah dari cacheComponents — enable selalu biar cacheTag/cacheLife
    // jalan, meski PPR mati di dev.
    useCache: true,
  },
  allowedDevOrigins: isDev ? getDevOrigins() : [],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    dangerouslyAllowLocalIP: isDev,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...sharedHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          ...(!isDev
            ? [{ key: "Content-Security-Policy", value: csp("'none'") }]
            : []),
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          ...(!isDev
            ? [{ key: "Content-Security-Policy", value: csp("'self'") }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
