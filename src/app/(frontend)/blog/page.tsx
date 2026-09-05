import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import Link from "next/link";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { readActiveFrontendPosts, readCategories } from "@/app/admin/posts/blogStore";
import { BlogGridClient } from "@/components/frontend/BlogGridClient";
import { createPageMetadata } from '@/utils/metadata';

export const dynamic = 'force-dynamic';

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const fallbackImages = [
  "/assets/images/blog/blog01.webp",
  "/assets/images/blog/blog02.webp",
  "/assets/images/blog/blog03.webp",
  "/assets/images/blog/blog-grid01.webp",
  "/assets/images/blog/blog-grid02.webp",
  "/assets/images/blog/blog-grid03.webp",
];

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('seo_blog_grid');
  return createPageMetadata(seo, '/blog');
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const categoryFilter = resolvedParams.category as string | undefined;
  const tagFilter = resolvedParams.tag as string | undefined;

  const [published, categories] = await Promise.all([readActiveFrontendPosts(), readCategories()]);
  
  let filteredPosts = published;
  if (categoryFilter) {
    filteredPosts = filteredPosts.filter((p) => p.categoryId === categoryFilter);
  }

  if (tagFilter) {
    filteredPosts = filteredPosts.filter((p) => p.tags && p.tags.includes(tagFilter));
  }

  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <Breadcrumb
        title="Blogs"
        paths={[{ name: "Blogs" }]}
        description="Explore Panzer IT resources, solutions and security insights designed to help your business stay informed and protected."
      />

      <section className="tv-blog-section space bg-light">
        <div className="container">
          <BlogGridClient 
            posts={filteredPosts as any} 
            fallbackImages={fallbackImages} 
            categoryMap={Object.fromEntries(categoryById)} 
          />
        </div>
      </section>
    </>
  );
}
