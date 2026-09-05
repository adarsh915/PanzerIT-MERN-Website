"use client";

import { useEffect } from "react";

interface DetailStickyProps {
  sectionSelector: string;
  sidebarSelector: string;
  sidebarInnerSelector: string;
  contentSelector: string;
  topOffset?: number;
  disabledMaxWidth?: number;
}

function DetailSticky({
  sectionSelector,
  sidebarSelector,
  sidebarInnerSelector,
  contentSelector,
  topOffset = 110,
  disabledMaxWidth = 991,
}: DetailStickyProps) {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(sectionSelector);
    const sidebar = document.querySelector<HTMLElement>(sidebarSelector);
    const sidebarInner = document.querySelector<HTMLElement>(sidebarInnerSelector);
    const content = document.querySelector<HTMLElement>(contentSelector);

    if (!section || !sidebar || !sidebarInner || !content) return;

    let animationFrame = 0;

    const resetSticky = () => {
      sidebar.style.position = "";
      sidebar.style.minHeight = "";
      sidebarInner.style.position = "";
      sidebarInner.style.top = "";
      sidebarInner.style.left = "";
      sidebarInner.style.width = "";
      sidebarInner.style.transform = "";
      sidebarInner.style.zIndex = "";
    };

    const getDocumentTop = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;

    const updateSticky = () => {
      if (window.innerWidth <= disabledMaxWidth) {
        resetSticky();
        return;
      }

      const contentTop = getDocumentTop(content);
      const sidebarTop = getDocumentTop(sidebar);
      const sidebarRect = sidebar.getBoundingClientRect();
      const contentBottom = getDocumentTop(content) + content.offsetHeight;
      const innerHeight = sidebarInner.offsetHeight;
      const startPoint = window.scrollY + topOffset;
      const stopPoint = contentBottom - innerHeight;

      sidebar.style.position = "relative";
      sidebar.style.minHeight = `${content.offsetHeight}px`;

      if (startPoint <= contentTop || stopPoint <= contentTop) {
        sidebarInner.style.position = "";
        sidebarInner.style.top = "";
        sidebarInner.style.left = "";
        sidebarInner.style.width = "";
        sidebarInner.style.transform = "";
        sidebarInner.style.zIndex = "";
        return;
      }

      if (startPoint >= stopPoint) {
        sidebarInner.style.position = "absolute";
        sidebarInner.style.top = `${Math.max(0, stopPoint - sidebarTop)}px`;
        sidebarInner.style.left = "0";
        sidebarInner.style.width = "100%";
        sidebarInner.style.transform = "";
        sidebarInner.style.zIndex = "5";
        return;
      }

      sidebarInner.style.position = "fixed";
      sidebarInner.style.top = `${topOffset}px`;
      sidebarInner.style.left = `${sidebarRect.left}px`;
      sidebarInner.style.width = `${sidebarRect.width}px`;
      sidebarInner.style.transform = "";
      sidebarInner.style.zIndex = "5";
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateSticky();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    updateSticky();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      resetSticky();
    };
  }, [contentSelector, disabledMaxWidth, sectionSelector, sidebarInnerSelector, sidebarSelector, topOffset]);

  return null;
}

export function SolutionDetailSticky() {
  return (
    <DetailSticky
      sectionSelector=".panzer-solution-detail-section"
      sidebarSelector=".panzer-solution-detail-sidebar"
      sidebarInnerSelector=".panzer-solution-detail-sidebar-inner"
      contentSelector=".panzer-solution-detail-content"
    />
  );
}

export function BrandDetailSticky() {
  return (
    <DetailSticky
      sectionSelector=".panzer-brand-detail-section"
      sidebarSelector=".panzer-brand-detail-sidebar"
      sidebarInnerSelector=".panzer-brand-detail-sidebar-inner"
      contentSelector=".panzer-brand-detail-content"
      topOffset={104}
      disabledMaxWidth={1199}
    />
  );
}
