"use client";

import { useEffect } from "react";

/**
 * Non-blocking CSS loader using preload + onload pattern
 * These CSS files are loaded asynchronously after page render
 * to prevent blocking First Contentful Paint (FCP)
 */
export function NonBlockingCSS() {
  useEffect(() => {
    // CSS files to load asynchronously (non-blocking)
    const cssFiles = [
      "/assets/css/flaticon.min.css?v=20260524",
      "/assets/css/animate.min.css?v=20260524",
      "/assets/css/select2.min.css?v=20260524",
      "/assets/css/odometer.css?v=20260524",
    ];

    cssFiles.forEach((href) => {
      // Check if already loaded
      if (document.querySelector(`link[href="${href}"]`)) {
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.media = "print"; // Trick: load as print stylesheet (non-blocking)
      link.onload = () => {
        link.media = "all"; // Once loaded, apply to all media
      };
      document.head.appendChild(link);
    });
  }, []);

  // Server-side: provide preload hints for faster discovery
  return (
    <>
      <link rel="preload" href="/assets/css/flaticon.min.css?v=20260524" as="style" />
      <link rel="preload" href="/assets/css/animate.min.css?v=20260524" as="style" />
      <link rel="preload" href="/assets/css/select2.min.css?v=20260524" as="style" />
      <link rel="preload" href="/assets/css/odometer.css?v=20260524" as="style" />
      {/* Use dangerouslySetInnerHTML to prevent React from trying to hydrate noscript children which often causes mismatch errors in React 18 */}
      <noscript dangerouslySetInnerHTML={{ __html: `
        <link rel="stylesheet" href="/assets/css/flaticon.min.css?v=20260524" />
        <link rel="stylesheet" href="/assets/css/animate.min.css?v=20260524" />
        <link rel="stylesheet" href="/assets/css/select2.min.css?v=20260524" />
        <link rel="stylesheet" href="/assets/css/odometer.css?v=20260524" />
      ` }} />
    </>
  );
}
