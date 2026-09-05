"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type BrandGridClientProps = {
  brands: any[];
  fallbackLogos: string[];
};

export function BrandGridClient({ brands, fallbackLogos }: BrandGridClientProps) {
  const [visibleCount, setVisibleCount] = useState(9);

  const paginatedBrands = brands.slice(0, visibleCount);
  const hasMore = visibleCount < brands.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  if (brands.length === 0) {
    return (
      <div className="col-12 text-center" style={{ padding: "40px 0" }}>
        <p>No brands published yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="row gy-30">
        {paginatedBrands.map((brand, index) => {
          const logoSrc = brand.logo || brand.image || fallbackLogos[index % fallbackLogos.length];
          
          return (
            <div key={brand.id} className="col-xl-4 col-lg-6 col-md-6 col-sm-6">
              <div className="tv-service-single-box wow fadeInUp" data-wow-delay={`${0.2 + ((index % 9) * 0.05)}s`}>
                <div className="inner-box d-flex flex-column h-100">
                  <div className="solution-card-image panzer-brand-logo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoSrc}
                      alt={brand.logoAlt || brand.imageAlt || brand.name}
                      width={190}
                      height={40}
                      style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "60px", objectFit: "contain" }}
                    />
                  </div>
                  <h4 className="title">{brand.name}</h4>
                  <p className="text pb-25 flex-grow-1">
                    {(() => {
                      const text = (brand.description || '').replace(/<[^>]*>?/gm, '');
                      return text.length > 120 ? text.substring(0, 120).trim() + '...' : text;
                    })()}
                  </p>
                  <Link href={`/brand/${brand.slug}`} className="theme-btn w-100 mt-40 panzer-static-read-btn">
                    <span className="link-effect">
                      <span className="effect-1">READ MORE</span>
                      <span className="effect-1">READ MORE</span>
                    </span>
                    <i className="fa-solid fa-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="row mt-50">
          <div className="col-12 text-center">
            <button 
                onClick={handleLoadMore} 
                className="theme-btn br-30" 
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", border: "none", outline: "none" }}
            >
              <span className="link-effect">
                <span className="effect-1">Load More</span>
                <span className="effect-1">Load More</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
