"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/frontend/SiteHeader";

interface SiteChromeProps {
  children: ReactNode;
  footer: ReactNode;         // pre-rendered server RSC passed from layout
  headerData?: {
    solutions: { label: string; icon: string; href: string; logo?: string; logoAlt?: string }[];
    brands: { label: string; href: string; logo?: string }[];
    logoData?: { logoUrl: string; logoAlt: string; logoWidth: number };
  };
}

function getPageClass(pathname: string) {
  if (pathname === "/") return "panzer-page-home";
  if (pathname === "/resources") return "panzer-page-solution-details";
  if (pathname.startsWith("/solution/category/")) return "panzer-page-solution";
  if (pathname.startsWith("/solution/")) return "panzer-page-solution-details";
  
  if (pathname.startsWith("/blog/category/") || pathname.startsWith("/blog/tag/")) return "panzer-page-blog";
  if (pathname.startsWith("/blog/")) return "panzer-page-blog-details";
  
  if (pathname.startsWith("/brand/category/")) return "panzer-page-brand";
  if (pathname.startsWith("/brand/")) return "panzer-page-brand-detail";

  const pageName = pathname
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-");

  return `panzer-page-${pageName || "home"}`;
}

export function SiteChrome({ children, footer, headerData }: SiteChromeProps) {
  const pathname = usePathname();

  return (
    <div className={`panzer-page ${getPageClass(pathname)}`}>
      <div className="page-wrapper bg-light">
        <SiteHeader headerData={headerData} />
        {children}
        {footer}
      </div>
    </div>
  );
}
