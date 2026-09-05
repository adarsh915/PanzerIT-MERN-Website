import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { BrandDetailSticky } from "@/components/frontend/SolutionDetailSticky";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findBrandBySlug, readRandomBrands, readCategories as readBrandCategories, readBrands } from "@/app/admin/brands/brandStore";
import { findFaqsByPageKey } from "@/app/admin/faqs/faqStore";
import { sanitizeHtml } from "@/utils/sanitize";
import { generateToc, generateSlug } from "@/utils/toc";
import { TableOfContents } from "@/components/frontend/TableOfContents";
import { Metadata } from "next";
import { formatPageTitle } from "@/utils/metadata";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

// Pre-render all known slugs at build time for instant first-load
export async function generateStaticParams() {
  try {
    const brands = await readBrands()
    return brands.map((b) => ({ slug: b.slug }))
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}




export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const brand = await findBrandBySlug(resolvedParams.slug);

  if (!brand) {
    return {
      title: formatPageTitle("Brand Not Found"),
    };
  }

  return {
    title: formatPageTitle(brand.metaTitle || brand.name),
    description: brand.metaDescription || brand.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    keywords: brand.metaKeywords,
    openGraph: {
      title: formatPageTitle(brand.metaTitle || brand.name),
      description: brand.metaDescription || brand.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
      images: brand.image || brand.logo ? [{ url: brand.image || brand.logo }] : undefined,
    },
    alternates: {
      canonical: `/brand/${brand.slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;

  const brand = await findBrandBySlug(resolvedParams.slug);

  if (!brand) {
    notFound();
  }

  const [activeBrands, faqs, categories] = await Promise.all([
    readRandomBrands(resolvedParams.slug, 10),
    findFaqsByPageKey(`brand-${resolvedParams.slug}`),
    readBrandCategories()
  ]);

  const { html: descriptionHtml, toc: descriptionToc } = generateToc(sanitizeHtml(brand.description || ""));

  const hasCapabilities = brand.capabilitiesTitle || brand.capabilitiesHeading || brand.capabilitiesPoints;
  const capabilitiesTitleHtml = brand.capabilitiesTitle || "Brand Capabilities";
  const capabilitiesTitleText = capabilitiesTitleHtml.replace(/<[^>]*>?/gm, '');
  const capabilitiesId = generateSlug(capabilitiesTitleText);
  const capabilitiesToc = hasCapabilities ? [{ id: capabilitiesId, text: capabilitiesTitleText, level: 3 }] : [];

  const processedExtraCards = brand.extraCards?.map(card => {
    const { html, toc } = generateToc(sanitizeHtml(card.description || ""));
    const headingId = generateSlug(card.heading);
    return { ...card, processedHtml: html, toc: [{ id: headingId, text: card.heading.replace(/<[^>]*>?/gm, ''), level: 3 }, ...toc] };
  }) || [];

  const faqTitle = "Frequently Asked Questions";
  const faqId = generateSlug(faqTitle);
  const faqToc = faqs.length > 0 ? [{ id: faqId, text: faqTitle, level: 3 }] : [];

  const fullToc = [
    ...descriptionToc,
    ...capabilitiesToc,
    ...processedExtraCards.flatMap(c => c.toc),
    ...faqToc
  ];

  const categoryName = brand.category || "Panzer IT Portfolio";

  // Capabilities points are now rendered directly as HTML from JoditEditor
  const pointsHtml = brand.capabilitiesPoints || "";

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question.replace(/<[^>]*>?/gm, '').trim(),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/<[^>]*>?/gm, '').trim()
      }
    }))
  } : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand.name,
    "description": brand.metaDescription || brand.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    "logo": brand.logo || brand.image,
    "image": brand.image ? {
      "@type": "ImageObject",
      "url": brand.image,
      "name": brand.imageTitle || brand.name,
      "caption": brand.imageCaption || undefined,
      "description": brand.imageDescription || undefined
    } : undefined,
    "url": `${siteUrl}/brand/${brand.slug}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <style>{`
        /* Fix iPad and tablet layout */
        @media (max-width: 1024px) {
          .panzer-brand-detail-layout {
            display: flex !important;
            flex-direction: column;
            gap: 20px;
          }
          .panzer-brand-detail-sidebar {
            order: 2;
            position: static !important;
            top: auto !important;
          }
          .panzer-brand-detail-content {
            order: 1;
          }
          .panzer-brand-detail-sidebar-inner {
            position: static !important;
            top: auto !important;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
        }
        .panzer-mobile-category-dropdown {
          background: var(--cardmention);
          border: 1px solid var(--cardmention);
          border-radius: 8px;
          margin-bottom: 25px;
          width: 100%;
        }
        .panzer-mobile-category-dropdown summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          color: var(--theme-navy-dark);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          list-style: none;
        }
        .panzer-mobile-category-dropdown summary::-webkit-details-marker {
          display: none;
        }
        .panzer-mobile-category-dropdown summary .summary-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .panzer-mobile-category-dropdown summary .summary-left i {
          font-size: 18px;
        }
        .panzer-mobile-category-dropdown[open] summary .summary-chevron {
          transform: rotate(180deg);
        }
        .panzer-mobile-category-dropdown summary .summary-chevron {
          transition: transform 0.3s ease;
        }
        .panzer-mobile-category-dropdown-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 20px 20px 20px;
        }
        .panzer-mobile-category-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 18px;
          border-radius: 12px;
          color: var(--theme-navy-darker);
          background: #f3f7ff;
          font-size: 14px;
          line-height: 1.3;
          font-weight: 800;
          text-decoration: none !important;
          white-space: normal;
        }
        .panzer-mobile-category-pill:hover,
        .panzer-mobile-category-pill.active {
          color: var(--text-light);
          background: var(--theme-color) !important;
        }
        .faq-question-title * {
          margin-bottom: 0 !important;
          margin-top: 0 !important;
          display: inline !important;
        }
      `}</style>
      <BrandDetailSticky />
      <Breadcrumb
        title={brand.name}
        paths={[{ name: "Brand", url: "/brand" }, { name: brand.name }]}
        description={brand.breadcrumbDescription}
        image={brand.breadcrumbImage}
        imageAlt={brand.breadcrumbImageAlt}
        imageTitle={brand.breadcrumbImageTitle}
        imageCaption={brand.breadcrumbImageCaption}
        imageDescription={brand.breadcrumbImageDescription}
      />


      <section className="panzer-brand-detail-section bg-light">
        <div className="container">
          <div className="panzer-brand-detail-layout">
            <aside className="panzer-brand-detail-sidebar" aria-label="Brand navigation">
              <div className="panzer-brand-detail-sidebar-inner">
                <div className="panzer-brand-detail-side-card d-none d-lg-block">
                  <h2>Brands</h2>
                  <nav>
                    {activeBrands.map((b) => (
                      <Link href={`/brand/${b.slug}`} key={b.id} className={b.id === brand.id ? "active" : ""}>
                        <span>{b.name}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    ))}
                  </nav>
                </div>

                {categories.length > 0 && (
                  <div className="panzer-brand-detail-side-card d-none d-lg-block" style={{ marginTop: '20px' }}>
                    <h2>Categories</h2>
                    <nav>
                      {categories.filter(c => c.status === "active").map((category) => (
                        <Link
                          href={`/brand/category/${category.slug}`}
                          key={category.id}
                        >
                          <span>{category.name}</span>
                          <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                      ))}
                    </nav>
                  </div>
                )}

                {/* <TableOfContents toc={fullToc} /> */}

                <div className="panzer-brand-detail-help">
                  <span className="panzer-brand-detail-help-icon">
                    <i className="fa-solid fa-headset"></i>
                  </span>
                  <h3>Need Brand Guidance?</h3>
                  <p>Talk to Panzer IT for the right security, backup and data protection brand fit.</p>
                  <Link href="/contact">
                    <span>Contact Us</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </aside>

            <div className="panzer-brand-detail-content">
              {/* Mobile Brands Dropdown */}
              {activeBrands.length > 0 && (
                <details className="panzer-mobile-category-dropdown d-block d-lg-none">
                  <summary>
                    <div className="summary-left">
                      <i className="fa-solid fa-list"></i>
                      <span>Brands</span>
                    </div>
                    <i className="fa-solid fa-chevron-down summary-chevron"></i>
                  </summary>
                  <div className="panzer-mobile-category-dropdown-content">
                    {activeBrands.map((b) => (
                      <Link
                        href={`/brand/${b.slug}`}
                        key={b.id}
                        className={`panzer-mobile-category-pill ${b.id === brand.id ? 'active' : ''}`}
                      >
                        <span>{b.name}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    ))}
                  </div>
                </details>
              )}

              {/* Mobile Categories Dropdown */}
              {categories.length > 0 && (
                <details className="panzer-mobile-category-dropdown d-block d-lg-none">
                  <summary>
                    <div className="summary-left">
                      <i className="fa-solid fa-table-cells-large"></i>
                      <span>Categories</span>
                    </div>
                    <i className="fa-solid fa-chevron-down summary-chevron"></i>
                  </summary>
                  <div className="panzer-mobile-category-dropdown-content">
                    {categories.filter(c => c.status === "active").map((category) => (
                      <Link
                        href={`/brand/category/${category.slug}`}
                        key={category.id}
                        className="panzer-mobile-category-pill"
                      >
                        <span>{category.name}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    ))}
                  </div>
                </details>
              )}

              <div className="panzer-brand-detail-hero" style={{ display: "block", marginBottom: "28px" }}>
                {/* Text Content (Category, Title, Description) - Image removed, now in breadcrumb */}
                <div style={{ display: "block", clear: "none" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                    {categoryName ? categoryName.split(',').map(c => c.trim()).filter(Boolean).map((cat, idx) => (
                      <div key={idx} className="panzer-brand-detail-pill">{cat}</div>
                    )) : (
                      <div className="panzer-brand-detail-pill">Panzer IT Portfolio</div>
                    )}
                  </div>
                  {/* <h2 style={{ marginTop: "20px", marginBottom: "20px" }}>{brand.name}</h2> */}
                  <div className="panzer-brand-detail-hero-text editor-content" dangerouslySetInnerHTML={{ __html: descriptionHtml }} style={{ display: "block", width: "auto" }} />
                </div>
              </div>

              {hasCapabilities ? (
                <div className="panzer-brand-detail-capabilities">
                  <h3 id={capabilitiesId} className="editor-content-heading" dangerouslySetInnerHTML={{ __html: capabilitiesTitleHtml }} />
                  {brand.capabilitiesHeading && (
                    <div className="editor-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(brand.capabilitiesHeading) }} />
                  )}
                  {pointsHtml && (() => {
                    // Extract text from each <li> and render as pill badges
                    const pills = Array.from(
                      pointsHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
                    ).map(m => m[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()).filter(Boolean);
                    return pills.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
                        {pills.map((pill, i) => (
                          <h4 key={i} className="panzer-brand-detail-pill">{pill}</h4>
                        ))}
                      </div>
                    ) : (
                      <div className="editor-content panzer-brand-detail-capabilities-points" dangerouslySetInnerHTML={{ __html: pointsHtml }} />
                    );
                  })()}
                </div>
              ) : null}

              {(processedExtraCards && processedExtraCards.length > 0) && (
                <div className="panzer-brand-detail-overview">
                  {processedExtraCards.map((card) => (
                    <div key={card.id}>
                      <h3 id={generateSlug(card.heading)} className="editor-content-heading" dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.heading) }} />
                      <div className="editor-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.processedHtml) }} />
                    </div>
                  ))}
                </div>
              )}

              {faqs.length > 0 && (
                <div className="panzer-brand-detail-faq">
                  <h3 id={faqId}>Frequently Asked Questions</h3>
                  {faqs.map((faq, index) => (
                    <details key={faq.id} open={index === 0}>
                      <summary>
                        <span className="d-flex align-items-center gap-1 faq-question-title">
                          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.question) }} />
                        </span>
                        <i className="fa-solid fa-chevron-down"></i>
                      </summary>
                      <div className="editor-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }} />
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
