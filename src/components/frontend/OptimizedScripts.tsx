"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

type ScriptConfig = {
  src: string;
  strategy: "beforeInteractive" | "afterInteractive" | "lazyOnload";
  pages?: string[]; // If specified, only load on these pages
};

const scripts: ScriptConfig[] = [
  // CRITICAL - Load early for basic functionality
  { src: "/assets/js/vendor/jquery-3.7.1.min.js", strategy: "afterInteractive" },
  { src: "/assets/js/bootstrap.min.js", strategy: "afterInteractive" },
  
  // DEPENDENCIES - Must load before main.js
  { src: "/assets/js/gsap.min.js", strategy: "afterInteractive" }, // main.js needs this
  { src: "/assets/js/ScrollTrigger.min.js", strategy: "afterInteractive" },
  { src: "/assets/js/lenis.min.js", strategy: "afterInteractive" }, // lenis added back
  { src: "/assets/js/select2.min.js", strategy: "afterInteractive" }, // main.js needs this
  { src: "/assets/js/swiper-bundle.min.js", strategy: "afterInteractive" },
  
  // SECONDARY - Can load after dependencies
  { src: "/assets/js/wow.min.js", strategy: "lazyOnload" },
  { src: "/assets/js/gsap-scroll-to-plugin.min.js", strategy: "lazyOnload" },
  
  // PAGE-SPECIFIC - Only load where absolutely needed
  { 
    src: "/assets/js/three.min.js", // 492KB! Only for homepage 3D effects
    strategy: "lazyOnload", 
    pages: ["/"] 
  },
  { 
    src: "/assets/js/hover.js", 
    strategy: "lazyOnload", 
    pages: ["/"] 
  },
  { 
    src: "/assets/js/jquery.fancybox.js", // 139KB - Only for image galleries
    strategy: "lazyOnload", 
    pages: ["/blog"] 
  },
  { 
    src: "/assets/js/jquery-ui.min.js", // 246KB - Check if needed at all
    strategy: "lazyOnload", 
    pages: ["/contact"] 
  },
  
  // LOW PRIORITY - Load last, all pages
  { src: "/assets/js/marquee.min.js", strategy: "lazyOnload" },
  { src: "/assets/js/jquery.validate.min.js", strategy: "lazyOnload" },
  { src: "/assets/js/jquery.appear.js", strategy: "lazyOnload" },
  { src: "/assets/js/jquery.odometer.min.js", strategy: "lazyOnload" },
  { src: "/assets/js/imagesloaded.pkgd.min.js", strategy: "lazyOnload" },
  { src: "/assets/js/isotope.pkgd.min.js", strategy: "lazyOnload" },
  { src: "/assets/js/splite-type.min.js", strategy: "lazyOnload" },
  { src: "/assets/js/vanilla-tilt.min.js", strategy: "lazyOnload" },
];

export function OptimizedScripts() {
  const pathname = usePathname();
  
  return (
    <>
      {scripts.map((script) => {
        // Skip if page-specific and current page doesn't match
        if (script.pages) {
          const shouldLoad = script.pages.some(page => 
            pathname === page || pathname.startsWith(page)
          );
          if (!shouldLoad) return null;
        }
        
        return (
          <Script
            key={script.src}
            src={script.src}
            strategy={script.strategy}
          />
        );
      })}
    </>
  );
}
