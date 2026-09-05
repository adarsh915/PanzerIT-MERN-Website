"use client";

import { useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  image?: string | null;
  imageAlt?: string | null;
  categoryId?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  [key: string]: any;
};

type BlogGridClientProps = {
  posts: Post[];
  fallbackImages: string[];
  categoryMap: Record<string, string>;
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export function BlogGridClient({ posts, fallbackImages, categoryMap }: BlogGridClientProps) {
  const [visibleCount, setVisibleCount] = useState(9);

  const paginatedPosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  if (posts.length === 0) {
    return (
      <div className="col-12 text-center" style={{ padding: "60px 0" }}>
        <p>No blog posts published yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="row gy-30">
        {paginatedPosts.map((post, index) => {
          const imgSrc = post.image || fallbackImages[index % fallbackImages.length];
          const categoryName = post.categoryId ? (categoryMap[post.categoryId] || "") : "";
          const dateStr = formatDate(post.publishedAt || post.createdAt);

          return (
            <div key={post.id} className="col-lg-4 col-md-6 col-sm-6">
              <article className="blog-single-box h-100">
                <div className="inner-box h-100 d-flex flex-column">
                  <div className="blog-image" style={{ 
                    height: '284px', 
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={post.imageAlt || post.title}
                      width={392}
                      height={284}
                      style={{ 
                        width: "100%", 
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center"
                      }}
                    />
                    <div className="category-tag">
                      <span></span>
                      {categoryName || dateStr}
                    </div>
                  </div>
                  <div className="blog-content d-flex flex-column flex-grow-1">
                    <h4 className="title">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h4>
                    <div className="pt-25 pb-30 mt-auto">
                      <div className="border dark"></div>
                    </div>
                    <div className="blog-meta">
                      <Link href={`/blog/${post.slug}`} className="continue-reading">
                        Read More
                      </Link>
                      <div className="blog-details__social-list">
                        <span>Share:</span>
                        <Link href="https://www.facebook.com/"><i className="fa-brands fa-facebook-f"></i></Link>
                        <Link href="https://x.com/"><i className="fa-brands fa-x-twitter"></i></Link>
                        <Link href="https://www.pinterest.com/"><i className="fa-brands fa-pinterest-p"></i></Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
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
