import type { NextConfig } from "next";

// ─── Security Headers ─────────────────────────────────────────────────────────
// Applied to every response from the Next.js server.
// Ref: https://nextjs.org/docs/app/api-reference/next-config-js/headers
const securityHeaders = [
  // Prevent the site from being embedded in an <iframe> on other domains (Clickjacking)
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Prevent MIME type sniffing (e.g., serving a JS file as text/plain)
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Control how much referrer info is sent with requests
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict browser features (camera, mic, geolocation, etc.)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  // Force HTTPS for 1 year in production (HSTS). Applied only when served over HTTPS.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Content Security Policy — restricts sources for scripts, styles, frames, etc.
  // 'unsafe-inline' is required for the rich-text editor and inline styles from the template.
  // 'unsafe-eval' is required by some legacy JS libraries bundled in the template.
  {
    key: 'Content-Security-Policy',
    value: [
      `default-src 'self'`,
      // Scripts: self + Google (reCAPTCHA, Maps), trusted CDNs + tagname.in chatbot
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://tagname.in`,
      // Styles: self + inline (needed for the admin template) + Google Fonts
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      // Fonts: self + Google Fonts CDN
      `font-src 'self' data: https://fonts.gstatic.com`,
      // Images: self + data URIs (for the editor) + external image sources
      `img-src 'self' data: blob: https:`,
      // Media: self + blob (for video preview)
      `media-src 'self' blob:`,
      // Connections: self + Google APIs + tagname.in + Iconify
      `connect-src 'self' https://maps.googleapis.com https://www.google.com https://tagname.in https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com`,
      // Frames: Google reCAPTCHA and Maps iframes
      `frame-src 'self' https://www.google.com https://www.gstatic.com https://maps.googleapis.com`,
      // Workers: self + blob (for Next.js and some editors)
      `worker-src 'self' blob:`,
      // Object/Embed: disallowed entirely
      `object-src 'none'`,
      // Base URI: only self (prevents base-tag hijacking)
      `base-uri 'self'`,
      // Form action: only self (prevents form hijacking)
      `form-action 'self'`,
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['mysql2'],

  // Performance optimizations
  // optimizeFonts: true, // Invalid top-level config, fonts are optimized by default

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    optimizeCss: true, // ✅ ENABLED: Inlines critical CSS with Critters (prevents FOUC)
    serverActions: {
      // Reduced from 64MB to 8MB — upload route enforces its own 10MB limit separately.
      // This prevents DoS via oversized Server Action payloads.
      bodySizeLimit: '8mb',
    },
  },

  images: {
    // Optimization enabled for better performance (WebP, resizing).
    // Plain <img> tags will bypass this, while <Image> tags will benefit.
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },

  transpilePackages: ['jodit', 'jodit-react'],
  devIndicators: false,

  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;

