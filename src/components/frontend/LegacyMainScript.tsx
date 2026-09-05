"use client";

import Script from "next/script";

const mainScriptSrc = "/assets/js/main.js?v=20260603-1";

export function LegacyMainScript() {
  return <Script src={mainScriptSrc} strategy="afterInteractive" />;
}
