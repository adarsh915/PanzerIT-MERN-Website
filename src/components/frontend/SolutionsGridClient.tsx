"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function SolutionsGridClient({ solutions }: { solutions: any[] }) {
  const [visibleCount, setVisibleCount] = useState(9);

  const paginatedSolutions = solutions.slice(0, visibleCount);
  const hasMore = visibleCount < solutions.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  return (
    <>
      <div className="row gy-30 panzer-solution-grid">
        {paginatedSolutions.map((solution, index) => {
          const globalIndex = index + 1;
          const rawDescription = solution.description || '';
          const snippet = solution.subtitle || rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 120) + (rawDescription.length > 120 ? '...' : '');
          return (
          <div key={solution.id} className="col-xl-4 col-lg-6 col-md-6">
            <div className="tv-service-single-box panzer-solution-card wow fadeInUp" data-wow-delay={`${0.2 + (index % 3) * 0.05}s`}>
              <div className="inner-box">
                <div className="panzer-solution-icon" aria-hidden="true" style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {solution.logo ? (
                    <Image 
                      src={solution.logo} 
                      alt={solution.logoAlt || solution.title} 
                      width={40} 
                      height={40} 
                      style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} 
                    />
                  ) : (
                    <i className="fa-solid fa-shield-halved"></i>
                  )}
                </div>
                <span className="panzer-solution-number">{String(globalIndex).padStart(2, "0")}</span>
                <h4 className="title">{solution.title}</h4>
                <p className="text">{snippet}</p>
                <Link href={`/solution/${solution.slug}`} className="panzer-solution-learn">
                  <span>Learn more</span>
                  <span className="panzer-solution-learn-arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        )})}
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
