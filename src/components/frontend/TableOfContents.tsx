"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/utils/toc";

interface TableOfContentsProps {
  toc: TocItem[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Highlight the highest visible element
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "0px 0px -80% 0px" } // Trigger when element hits top 20% of viewport
    );

    // Observe all heading elements
    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [toc]);

  if (toc.length === 0) {
    return null;
  }

  return (
    <div className="sidebar-widget mt-30">
      <h4 className="sidebar-title">Table of Contents</h4>
      <div className="widget-box" style={{ padding: "15px" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {toc.map((item) => (
            <li
              key={item.id}
              style={{
                marginLeft: item.level === 3 ? "15px" : "0",
                marginBottom: "8px",
              }}
            >
              <a
                href={`#${item.id}`}
                style={{
                  color: activeId === item.id ? "var(--theme-color)" : "#666",
                  fontWeight: activeId === item.id ? 600 : 400,
                  transition: "color 0.2s ease",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "15px",
                }}
                onClick={(e) => {
                  // Smooth scroll fallback (modern browsers support CSS scroll-behavior)
                  const el = document.getElementById(item.id);
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: "smooth" });
                    // Update URL hash manually since we prevented default
                    window.history.pushState(null, "", `#${item.id}`);
                    setActiveId(item.id);
                  }
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
