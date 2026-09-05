import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { SolutionDetailSticky } from "@/components/frontend/SolutionDetailSticky";
import Image from "next/image";
import Link from "next/link";
import { findSolutionBySlug, readRandomSolutions, readCategories as readSolutionCategories, readSolutions } from "@/app/admin/solutions/solutionStore";
import { findFaqsByPageKey } from "@/app/admin/faqs/faqStore";
import { notFound } from "next/navigation";
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
    const solutions = await readSolutions()
    return solutions.map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

const solutionCategories = [
  "Scopd DLP with UEBA",
  "Vulnerability Scanner, Assessment & VAPT",
  "Employee Monitoring Solution",
  "Most Advanced Anti-Malware",
  "Backup & Disaster Recovery",
  "IAM | PAM | PSM & DBAM",
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const solution = await findSolutionBySlug(slug);

  if (!solution) {
    return {
      title: formatPageTitle("Solution Not Found"),
    };
  }

  return {
    title: formatPageTitle(solution.metaTitle || solution.title),
    description: solution.metaDescription || solution.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    keywords: solution.metaKeywords,
    openGraph: {
      title: solution.metaTitle || solution.title,
      description: solution.metaDescription || solution.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
      images: solution.image ? [{ url: solution.image }] : undefined,
    },
    alternates: {
      canonical: `/solution/${solution.slug}`,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const solution = await findSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const [solutions, faqs, categories] = await Promise.all([
    readRandomSolutions(slug, 10),
    findFaqsByPageKey(`solution-${slug}`),
    readSolutionCategories()
  ]);

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

  const { html: descriptionHtml, toc: descriptionToc } = generateToc(sanitizeHtml(solution.description || ""));

  const featureCardsToc = (solution.featureCards || []).map(item => {
    const plainTitle = item.title.replace(/<[^>]*>?/gm, '').trim();
    return {
      id: generateSlug(plainTitle),
      text: plainTitle,
      level: 3
    };
  });

  let processedExtraCards: any[] = [];
  let extraCardsToc: any[] = [];

  if (solution.extraCards && solution.extraCards.length > 0) {
    processedExtraCards = solution.extraCards.map((card) => {
      const { html, toc } = generateToc(sanitizeHtml(card.description || ""));
      const headingId = generateSlug(card.heading);

      // We still add to TOC, but keep in mind heading might have HTML now
      // The generateSlug will strip HTML internally if it just uses regex to remove non-words
      extraCardsToc.push({ id: headingId, text: card.heading.replace(/<[^>]*>?/gm, ''), level: 3 }, ...toc);

      return { ...card, processedHtml: html, headingId };
    });
  }

  const implFlowTitle = "Implementation Flow";
  const implFlowId = generateSlug(implFlowTitle);
  const implFlowToc = (solution.implementationSteps && solution.implementationSteps.length > 0)
    ? [{ id: implFlowId, text: implFlowTitle, level: 3 }]
    : [];

  const faqTitle = "Frequently Asked Questions";
  const faqId = generateSlug(faqTitle);
  const faqToc = faqs.length > 0 ? [{ id: faqId, text: faqTitle, level: 3 }] : [];

  const fullToc = [
    ...descriptionToc,
    ...featureCardsToc,
    ...extraCardsToc,
    ...implFlowToc,
    ...faqToc
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": solution.metaTitle || solution.title,
    "description": solution.metaDescription || solution.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    "provider": {
      "@type": "Organization",
      "name": "Panzer IT",
      "url": siteUrl,
      "logo": `${siteUrl}/assets/images/logo/logo.png`
    },
    "image": solution.image ? {
      "@type": "ImageObject",
      "url": solution.image,
      "name": solution.imageTitle || solution.title,
      "caption": solution.imageCaption || undefined,
      "description": solution.imageDescription || undefined
    } : undefined,
    "url": `${siteUrl}/solution/${solution.slug}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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
          .panzer-page-solution-details .panzer-solution-detail-layout {
            display: flex !important;
            flex-direction: column;
            gap: 20px;
          }
          .panzer-page-solution-details .panzer-solution-detail-sidebar {
            order: 2;
            position: static !important;
            top: auto !important;
          }
          .panzer-page-solution-details .panzer-solution-detail-content {
            order: 1;
          }
          .panzer-page-solution-details .panzer-solution-detail-sidebar-inner {
            position: static !important;
            top: auto !important;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
        }

        @media only screen 
  and (min-width: 834px) 
  and (max-width: 1194px) {
    .panzer-page-solution-details .panzer-solution-detail-layout {
        display: grid;
        grid-template-columns: minmax(240px, 320px) minmax(0, 1fr) !important;
        gap: 30px;
        align-items: start;
    }
}
        .faq-question-title * {
          margin-bottom: 0 !important;
          margin-top: 0 !important;
          display: inline !important;
        }
        .panzer-category-pills-container {
          flex-wrap: wrap;
          max-width: 100%;
        }
        .panzer-mobile-category-dropdown {
          background: var(--cardmention);
          border: 1px solid var(--cardmention);
          border-radius: 8px;
        
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
        @media (max-width: 768px) {
          .panzer-category-pills-container {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -ms-overflow-style: none !important;  /* IE and Edge */
            scrollbar-width: none !important;  /* Firefox */
            padding-bottom: 4px;
            max-width: calc(100vw - 30px);
            width: 100%;
            -webkit-overflow-scrolling: touch;
          }
          .panzer-category-pills-container::-webkit-scrollbar {
            display: none !important;
          }
          .panzer-category-pills-container .panzer-solution-detail-pill {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>
      <SolutionDetailSticky />
      <Breadcrumb
        title={solution.title}
        paths={[{ name: "Solution", url: "/solution" }, { name: solution.title }]}
        description={solution.breadcrumbDescription}
        image={solution.breadcrumbImage}
        imageAlt={solution.breadcrumbImageAlt}
        imageTitle={solution.breadcrumbImageTitle}
        imageCaption={solution.breadcrumbImageCaption}
        imageDescription={solution.breadcrumbImageDescription}
      />


      <section className="panzer-solution-detail-section bg-light">
        <div className="container">
          <div className="panzer-solution-detail-layout">
            <aside className="panzer-solution-detail-sidebar" aria-label="Solution categories">
              <div className="panzer-solution-detail-sidebar-inner">
                <div className="panzer-solution-detail-side-card d-none d-lg-block">
                  <h2>Solutions</h2>
                  <nav>
                    {solutions.map((solution) => (
                      <Link
                        href={`/solution/${solution.slug}`}  // ← dynamic slug route
                        key={solution.id}
                        className={solution.slug === slug ? "active" : undefined}  // ← highlight current
                      >
                        <span>{solution.title}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    ))}
                  </nav>
                </div>

                {categories.length > 0 && (
                  <div className="panzer-solution-detail-side-card d-none d-lg-block" style={{ marginTop: '20px' }}>
                    <h2>Categories</h2>
                    <nav>
                      {categories.filter(c => c.status === "active").map((category) => (
                        <Link
                          href={`/solution/category/${category.slug}`}
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

                <div className="panzer-solution-detail-help">
                  <span className="panzer-solution-detail-help-icon">
                    <i className="fa-solid fa-headset"></i>
                  </span>
                  <h3>Need Solution Guidance?</h3>
                  <p>Talk to Panzer IT for the right security, backup and data protection solution fit.</p>
                  <Link href="/contact">
                    <span>Contact Us</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </aside>

            <div className="panzer-solution-detail-content">
              {/* Mobile Solutions Dropdown (Replaces Sidebar Solutions on Mobile) */}
              {solutions.length > 0 && (
                <details className="panzer-mobile-category-dropdown d-block d-lg-none">
                  <summary>
                    <div className="summary-left">
                      <i className="fa-solid fa-list"></i>
                      <span>Solutions</span>
                    </div>
                    <i className="fa-solid fa-chevron-down summary-chevron"></i>
                  </summary>
                  <div className="panzer-mobile-category-dropdown-content">
                    {solutions.map((s) => (
                      <Link
                        href={`/solution/${s.slug}`}
                        key={s.id}
                        className={`panzer-mobile-category-pill ${s.slug === slug ? 'active' : ''}`}
                      >
                        <span>{s.title}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    ))}
                  </div>
                </details>
              )}

              {/* Mobile Categories Dropdown (Replaces Sidebar Categories on Mobile) */}
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
                        href={`/solution/category/${category.slug}`}
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

              <div className="panzer-solution-detail-hero" style={{ display: "block" }}>

                {/* 2. Text Content (Title, Description) - Image removed, now in breadcrumb */}
                <div style={{ display: "block", clear: "none" }}>
                  <div className="panzer-category-pills-container" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    {solution.category ? solution.category.split(',').map(c => c.trim()).filter(Boolean).map((cat, idx) => (
                      <div key={idx} className="panzer-solution-detail-pill">{cat}</div>
                    )) : (
                      <div className="panzer-solution-detail-pill">Panzer IT Portfolio</div>
                    )}
                  </div>
                  {/* <h2 style={{ marginTop: "20px", marginBottom: "20px" }}>{solution.title}</h2> */}
                  <div className="panzer-solution-detail-hero-text editor-content" dangerouslySetInnerHTML={{ __html: descriptionHtml }} style={{ display: "block", width: "auto" }} />
                </div>
              </div>

              <div className="panzer-solution-detail-highlights">
                {(() => {
                  const staticIcons = ["fa-shield-halved", "fa-user-lock", "fa-rotate", "fa-bug-slash"];
                  return (solution.featureCards || []).map((item, index) => {
                    const plainTitle = item.title.replace(/<[^>]*>?/gm, '').trim();
                    return (
                      <article key={item.id}>
                        <span>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.imageAlt || plainTitle}
                              title={item.imageTitle || plainTitle}
                              data-caption={item.imageCaption}
                              data-description={item.imageDescription}
                              style={{ width: '60%', height: '60%', objectFit: 'contain' }}
                            />
                          ) : (
                            <i className={`fa-solid ${staticIcons[index % staticIcons.length]}`}></i>
                          )}
                        </span>
                        <h3 id={generateSlug(plainTitle)} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.title) }}></h3>
                        <div className="editor-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}></div>
                      </article>
                    );
                  });
                })()}
              </div>

              {processedExtraCards && processedExtraCards.length > 0 && (
                <>
                  {processedExtraCards.map((card) => (
                    <div key={card.id} className="panzer-solution-detail-overview">
                      <h3
                        id={card.headingId}
                        className="editor-content-heading"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.heading) }}
                      />
                      <div
                        className="editor-content"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.processedHtml) }}
                      />
                    </div>
                  ))}
                </>
              )}

              <div className="panzer-solution-detail-process">
                <h3 id={implFlowId}>Implementation Flow</h3>
                <div>
                  {(solution.implementationSteps || []).map((item) => (
                    <article key={item.id}>
                      <span>{item.step}</span>
                      <h4 dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.title) }}></h4>
                      <div className="editor-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}></div>
                    </article>
                  ))}
                </div>
              </div>

              {faqs.length > 0 && (
                <div className="panzer-solution-detail-faq">
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
