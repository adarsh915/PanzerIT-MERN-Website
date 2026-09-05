/* eslint-disable @next/next/no-css-tags, @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { RouteScripts } from "@/components/frontend/RouteScripts";
import { LegacyMainScript } from "@/components/frontend/LegacyMainScript";
import { OptimizedScripts } from "@/components/frontend/OptimizedScripts";
import { SiteChrome } from "@/components/frontend/SiteChrome";
import { getHeaderData } from "./headerDataStore";
import { readSetting } from "@/app/admin/settings/settingsStore";
import { ScrollToTop } from "@/components/frontend/ScrollToTop";
import { HomeServicePins } from "@/components/frontend/HomeServicePins";
import { NonBlockingCSS } from "@/components/frontend/NonBlockingCSS";
import { cookies } from "next/headers";
import { ThemePreviewBanner } from "@/components/frontend/ThemePreviewBanner";
import { getCustomCode } from "@/app/admin/settings/custom-code/customCodeStore";

// PERFORMANCE FIX: Import CSS through Next.js bundler for optimization
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap from npm (227KB → optimized)
import "./globals.css";

import { SiteFooter } from "@/components/frontend/SiteFooter";

export const metadata: Metadata = {
  title: "Panzer IT | Make 'IT' Secure",
  description: "Panzer IT — Professional IT Services",
  icons: {
    icon: '/assets/images/favicons/favicon.jpeg',
    shortcut: '/assets/images/favicons/favicon.jpeg',
    apple: '/assets/images/favicons/favicon.jpeg',
  },
};

// ISR: re-render at most once per minute; cache serves all other requests instantly
export const revalidate = 60;

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Optimized: Single cached query instead of loading full datasets
  const headerData = await getHeaderData();

  let themeColors = await readSetting<Record<string, string>>('frontend_theme_colors', {});
  const customCode = await getCustomCode();
  
  // Theme Preview Override via Cookies
  const cookieStore = await cookies();
  const previewCookie = cookieStore.get('theme_preview_colors')?.value;
  let isPreviewMode = false;
  if (previewCookie) {
    try {
      const previewColors = JSON.parse(previewCookie);
      themeColors = { ...themeColors, ...previewColors };
      isPreviewMode = true;
    } catch (e) {
      console.error('Failed to parse theme preview cookie:', e);
    }
  }

  const cssVariables = Object.entries(themeColors)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n          ');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root, html:root, body {
          --theme-color: #1053f3;
          --theme-navy-dark: #061153;
          --theme-blue-light: #79c6ff;
          --theme-navy-darker: #061238;
          --theme-blue-medium: #2f63dd;
          --theme-navy-medium: #123b88;
          --theme-blue-bright: #2b72ff;
          --theme-navy-slate: #273553;
          --theme-navy-deep: #07133d;
          --theme-navy-slate-light: #34405e;
          --theme-blue-dark: #051372;
          --dark-color3: #000000;
          --cardmention: #ffffff;
          --card-hover-light: radial-gradient(circle at 10% 18%, rgba(255, 255, 255, 0.95) 0 16%, rgba(255, 255, 255, 0) 34%), radial-gradient(circle at 90% 0%, rgba(220, 246, 255, 0.95) 0 20%, rgba(220, 246, 255, 0) 46%), linear-gradient(135deg, #d9f4ff 0%, #eefbff 45%, #c7ecff 100%);
          --footer-bg: #0b1322;
          --footer-text-main: #dde2ec;
          --footer-text-second: #7d889c;
          --footer-text-hover: #3a8bf5;
          --footer-border: #1c2638;
          --footer-input-bg: #161f30;
          --hero-bg: linear-gradient(135deg, #0a1628 0%, #1a2847 25%, #0d1b3a 50%, #162640 75%, #0a1628 100%);
          --hero-text-color: #ffffff;
          --hero-btn-bg: #e76b1f;
          ${cssVariables || ''}
        }
      `}} />
      {/* Resource Hints - Improve connection speed */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* ── Admin: Custom Head Scripts ── */}
      {customCode.headScripts && (
        <div dangerouslySetInnerHTML={{ __html: customCode.headScripts }} />
      )}

      {/* ── Admin: Custom Head CSS ── */}
      {customCode.headCSS && (
        customCode.headCSS.trimStart().startsWith('<') ? (
          <div dangerouslySetInnerHTML={{ __html: customCode.headCSS }} />
        ) : (
          <style dangerouslySetInnerHTML={{ __html: customCode.headCSS }} />
        )
      )}
      
      {/* Fonts - Async loading */}
      <link
        href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400&family=Manrope:wght@200..800&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />
      
      {/* CRITICAL CSS */}
      <link rel="stylesheet" href="/assets/css/style.css" />
      {/* Swiper CSS - Keep blocking (critical for slider) */}
      <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css?v=20260524" />
      
      {/* Font Awesome - Keep blocking (icons used everywhere) */}
      <link rel="stylesheet" href="/assets/fontawesome/css/fontawesome.min.css?v=20260524" />
      
      {/* ✅ OPTIMIZED: Bootstrap loaded via Next.js bundler (imported above) */}
      
      {/* NON-BLOCKING CSS - Loaded asynchronously after initial render */}
      <NonBlockingCSS />

      <SiteChrome headerData={headerData} footer={<SiteFooter />}>
        {children}
      </SiteChrome>

      {/* Optimized Scripts - Load smartly based on page needs */}
      <OptimizedScripts />
      <LegacyMainScript />
      <RouteScripts />
      <ScrollToTop />
      <HomeServicePins />
      
      {isPreviewMode && <ThemePreviewBanner />}

      {/* ── Admin: Custom Footer Scripts ── */}
      {customCode.footerScripts && (
        <div dangerouslySetInnerHTML={{ __html: customCode.footerScripts }} />
      )}
    </>
  );
}
