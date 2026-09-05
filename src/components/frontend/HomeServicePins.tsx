"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";



/**
 * Handles the GSAP ScrollTrigger pin animation for the homepage service cards.
 * Re-initializes every time the user navigates to "/" to fix the "navigate away
 * then come back and animation is broken" issue.
 */
export function HomeServicePins() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    let cancelled = false;

    function initPins() {
      if (cancelled) return;

      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;

      if (!gsap || !ScrollTrigger) {
        // GSAP not ready yet — retry
        setTimeout(initPins, 100);
        return;
      }

      const serviceSection = document.querySelector(
        ".tv-service-section.style-4"
      ) as HTMLElement | null;

      if (!serviceSection) {
        // DOM not ready — retry
        setTimeout(initPins, 100);
        return;
      }

      const serviceRows = Array.from(
        serviceSection.querySelectorAll<HTMLElement>(".service-item-pin")
      );

      if (serviceRows.length === 0) {
        setTimeout(initPins, 100);
        return;
      }

      // Kill ALL existing ScrollTrigger instances that belong to this section
      ScrollTrigger.getAll().forEach((trigger: any) => {
        if (
          trigger.trigger &&
          serviceSection.contains(trigger.trigger as Node)
        ) {
          trigger.kill();
        }
      });

      // Reset any leftover inline styles
      serviceRows.forEach((row) => {
        row.style.opacity = "";
        row.style.transform = "";
        row.style.willChange = "";
      });

      // Only apply pin animation on desktop (>992px)
      if (window.innerWidth <= 992) {
        ScrollTrigger.refresh();
        return;
      }

      serviceRows.forEach((row) => {
        gsap.to(row, {
          opacity: 0,
          scale: 0.9,
          y: 50,
          scrollTrigger: {
            trigger: row,
            scrub: 0.5,
            start: "top 100px",
            end: "top -300px",
            pin: true,
            pinSpacing: false,
          },
        });
      });

      // Wait for layout to settle, then refresh
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!cancelled) ScrollTrigger.refresh();
        }, 150);
      });
    }

    // Give React a tick to finish rendering, then init
    const timer = setTimeout(initPins, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
