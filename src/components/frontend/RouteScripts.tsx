"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const routeScripts: Record<string, string> = {
  "/": "/page-scripts/home.js?v=20260625-3",
  "/brand": "/page-scripts/brand.js?v=20260528",
  "/solution": "/page-scripts/solution.js?v=20260528",
  "/resources": "/page-scripts/solution.js?v=20260528",
  "/blog": "/page-scripts/blog.js?v=20260603",
};

declare global {
  interface Window {
    PanzerTheme?: {
      init?: () => void;
    };
    ScrollTrigger?: {
      refresh: () => void;
      getAll: () => Array<{ trigger: Element | null; kill: () => void }>;
    };
  }
}

export function RouteScripts() {
  const pathname = usePathname();
  let src = routeScripts[pathname];

  if (!src && pathname.startsWith("/solution/")) {
    src = routeScripts["/solution"];
  }

  if (!src && pathname.startsWith("/blog/")) {
    src = routeScripts["/blog"];
  }

  if (!src && pathname.startsWith("/brand/")) {
    src = routeScripts["/brand"];
  }

  const [scriptSrc, setScriptSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src) {
      const separator = src.includes("?") ? "&" : "?";
      setScriptSrc(`${src}${separator}route=${encodeURIComponent(pathname)}&t=${Date.now()}`);
    } else {
      setScriptSrc(null);
    }
  }, [pathname, src]);

  const handleScriptLoad = () => {
    let attempt = 0;
    const initTheme = () => {
      if (window.PanzerTheme?.init) {
        window.PanzerTheme.init();

        // After init, force ScrollTrigger to recalculate in case of navigation-back
        const refreshScrollTrigger = () => {
          if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
          }
        };
        // Small delay to let the DOM settle after navigation
        setTimeout(refreshScrollTrigger, 200);
        return;
      }
      if (attempt < 40) {
        attempt++;
        setTimeout(initTheme, 100);
      }
    };
    // Wait for next paint + 300ms before first attempt so the new page DOM is ready
    requestAnimationFrame(() => {
      setTimeout(initTheme, 300);
    });
  };

  if (!scriptSrc) return null;

  return (
    <Script 
      src={scriptSrc} 
      strategy="lazyOnload" 
      onLoad={handleScriptLoad} 
    />
  );
}
