import { Metadata } from "next";
import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPostBySlug, readActiveFrontendPosts, readCategories } from "@/app/admin/posts/blogStore";
import { sanitizeHtml } from "@/utils/sanitize";
import { generateToc } from "@/utils/toc";
import { TableOfContents } from "@/components/frontend/TableOfContents";
import { formatPageTitle } from "@/utils/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await findPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: formatPageTitle("Post Not Found"),
    };
  }

  return {
    title: formatPageTitle(post.metaTitle || post.title),
    description: post.metaDescription || (post.description || '').substring(0, 160).replace(/<[^>]*>?/gm, ''), // Fallback description stripping HTML tags
    keywords: post.metaKeywords,
    openGraph: {
      title: formatPageTitle(post.metaTitle || post.title),
      description: post.metaDescription || (post.description || '').substring(0, 160).replace(/<[^>]*>?/gm, ''),
      images: post.image ? [{ url: post.image }] : undefined,
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await findPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const [publishedPosts, categories] = await Promise.all([readActiveFrontendPosts(), readCategories()]);
  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

  // Only show categories that have at least one published post
  const activeCategories = categories.filter((c) =>
    publishedPosts.some((p) => p.categoryId === c.id)
  );

  const allTags = Array.from(new Set(publishedPosts.flatMap((p) => p.tags || []))).filter(Boolean);

  // Related posts for sidebar
  const relatedPosts = publishedPosts
    .filter((p) => p.id !== post.id && p.categoryId === post.categoryId)
    .slice(0, 5);

  const imgSrc = post.image || "/assets/images/blog/blog-thumb05.webp";
  const author = post.author || "Admin";
  const dateStr = formatDate(post.publishedAt || post.createdAt);
  const categoryName = post.categoryId ? categoryById.get(post.categoryId) : "";
  const postCategorySlug = post.categoryId ? categories.find(c => c.id === post.categoryId)?.slug || post.categoryId : "";

  const { html: contentHtml, toc } = generateToc(sanitizeHtml(post.description || ""));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.metaTitle || post.title,
    "description": post.metaDescription || (post.description || '').replace(/<[^>]*>?/gm, ''),
    "image": post.image ? {
      "@type": "ImageObject",
      "url": post.image,
      "name": post.imageTitle || post.title,
      "caption": post.imageCaption || undefined,
      "description": post.imageDescription || undefined
    } : undefined,
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.publishedAt || post.createdAt,
    "author": {
      "@type": "Organization",
      "name": "Panzer IT"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Panzer IT",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/assets/images/logo/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`
    }
  };

  return (
    <>
      {/* Required for sticky sidebar because global CSS sets overflow: hidden on .page-wrapper or parents */}
      <style dangerouslySetInnerHTML={{
        __html: `
        html, body, .panzer-page, .page-wrapper, .blog-details-section, .blog-details-section .container, .blog-details-section .row {
          overflow: visible !important;
          clip-path: none !important;
        }
      `}} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Breadcrumb
        title={post.title}
        paths={[{ name: "Blog", url: "/blog" }, { name: post.title }]}
        description={post.breadcrumbDescription}
        image={post.breadcrumbImage}
        imageAlt={post.breadcrumbImageAlt}
        imageTitle={post.breadcrumbImageTitle}
        imageCaption={post.breadcrumbImageCaption}
        imageDescription={post.breadcrumbImageDescription}
      />


      <section className="blog-details-section space bg-light">
        <div className="container">
          <div className="row gy-30">
            <div className="col-xl-8 col-lg-8">
              <div className="blog-details-left">
                <div className="blog-list-card style-2">
                  {/* Image removed - now shown in breadcrumb */}
                  <div className="card-content">
                    {/* <h3 className="title">{post.title}</h3> */}
                    <div className="author-info">
                      <div className="author">

                        <span className="name"><span>By</span> {author}</span>
                      </div>
                      <span className="date"><i className="icon-calender"></i> {dateStr}</span>
                    </div>
                    <div className="pt-20 pb-25"><div className="border dark"></div></div>

                    {/* Dynamic Content */}
                    <div className="text editor-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

                    {post.authorBio && (
                      <div className="author-bio-box mt-40 p-4 bg-white rounded" style={{ borderLeft: '4px solid #0056b3' }}>
                        <h5 className="mb-3" style={{ fontWeight: 600 }}>About {author}</h5>
                        <div className="text-muted editor-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.authorBio) }} />
                      </div>
                    )}

                    <div className="blog-details__bottom mt-40">
                      <div className="blog-details__tags">
                        <span>Posted In :</span>
                        <ul className="blog-details__tags">
                          {categoryName ? <li><Link href={`/blog/category/${postCategorySlug}`}>{categoryName}</Link></li> : null}
                        </ul>
                      </div>
                      <div className="blog-details__social-list">
                        <span>Share:</span>
                        <Link href="https://www.facebook.com/"><i className="fa-brands fa-facebook-f"></i></Link>
                        <Link href="https://x.com/"><i className="fa-brands fa-x-twitter"></i></Link>
                        <Link href="https://www.pinterest.com/"><i className="fa-brands fa-pinterest-p"></i></Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div className="comment-one">
                  <h3 className="comment-one__title">1 Comment</h3>
                  <div className="comment-one__single">
                    <div className="comment-one__image">
                      <Image src="/assets/images/blog/comment-1.png" alt="User avatar" width={80} height={80} style={{ width: "100%", height: "auto" }} />
                    </div>
                    <div className="comment-one__content">
                      <div className="title"><h5>James Noel</h5><span>August 18, 2025</span></div>
                      <p>Globally supply resource maximizing total linkage whereas seamless experiences resource sucking outsourcing before viral e-services</p>
                      <Link href="#" className="comment-one__btn">
                        <i className="fa-regular fa-share"></i><span className="btn-title">Reply</span>
                      </Link>
                    </div>
                  </div>
                  <div className="comment-form">
                    <h3 className="comment-one__title">Add a Comment</h3>
                    <form id="comment-form" className="comment-form" action="#" method="post">
                      <div className="row">
                        <div className="mb-20">
                          <textarea name="form_message" className="form-control" rows={6} placeholder="Write Comments..."></textarea>
                        </div>
                        <div className="col-sm-6">
                          <div className="mb-20">
                            <input name="form_name" className="form-control" type="text" placeholder="Your Name *" required={true} />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="mb-20">
                            <input name="form_email" className="form-control" type="email" placeholder="Enter E-Mail *" required={true} />
                          </div>
                        </div>
                        <div className="mb-25">
                          <input name="form_subject" className="form-control" type="text" placeholder="Subject *" required={true} />
                        </div>
                      </div>
                      <div className="mb-0">
                        <div className="form-group remember-check mb-0">
                          <input type="checkbox" id="remember-me" required={true} />
                          <label htmlFor="remember-me">Save my name & email in the Browser</label>
                        </div>
                        <button type="button" className="theme-btn error bg-theme mt-25">
                          <span className="link-effect">
                            <span className="btn-title">Submit Now</span>
                          </span><i className="fa-regular fa-arrow-right-long"></i>
                        </button>
                      </div>
                    </form>
                  </div>
                </div> */}
              </div>
            </div>

            <div className="col-xl-4 col-lg-4" style={{ alignSelf: "stretch", minHeight: "100%" }}>
              <div className="sidebar-widget blog-sidebar pl-15 lg-pl-0" style={{ position: "sticky", top: "120px", height: "max-content", zIndex: 10 }}>
                {/* <TableOfContents toc={toc} /> */}

                <div className="sidebar-category-list">
                  <h4 className="sidebar-title"> Category </h4>
                  <div className="widget-box">
                    <ul className="categories">
                      {activeCategories.map((cat) => {
                        const postCount = publishedPosts.filter((p) => p.categoryId === cat.id).length;
                        return (
                          <li key={cat.id}>
                            <Link href={`/blog/category/${cat.slug || cat.id}`}>
                              {cat.name} <span>({postCount})</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {relatedPosts.length > 0 && (
                  <div className="sidebar-latest-posts">
                    <h4 className="sidebar-title"> Related Posts </h4>
                    <div className="widget-box">
                      <div className="latest-posts">
                        {relatedPosts.map((lp, idx) => {
                          const fallbackImages = [
                            "/assets/images/blog/latest-details01.webp",
                            "/assets/images/blog/latest-details02.webp",
                            "/assets/images/blog/latest-details03.webp",
                          ];
                          const lpImg = lp.image || fallbackImages[idx % fallbackImages.length];
                          return (
                            <div className="post" key={lp.id}>
                              <Link href={`/blog/${lp.slug}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={lpImg} alt="Post Image" width={88} height={88} />
                              </Link>
                              <div className="post-content">
                                <Link href={`/blog/${lp.slug}`}>{lp.title}</Link>
                                <p>{formatDate(lp.publishedAt || lp.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {allTags.length > 0 && (
                  <div className="sidebar-widget mt-30">
                    <h4 className="sidebar-title"> Tags </h4>
                    <div className="widget-box">
                      <ul className="blog-details__tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {allTags.map((tag, idx) => (
                          <li key={idx}><Link href={`/blog/tag/${encodeURIComponent(tag)}`}>{tag}</Link></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
