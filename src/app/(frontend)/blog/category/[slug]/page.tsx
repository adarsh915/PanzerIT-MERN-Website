import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { findCategoryBySlug, readCategories, readActiveFrontendPosts } from "@/app/admin/posts/blogStore";
import { BlogGridClient } from "@/components/frontend/BlogGridClient";
import { createPageMetadata } from '@/utils/metadata';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const fallbackImages = [
  "/assets/images/blog/blog01.webp",
  "/assets/images/blog/blog02.webp",
  "/assets/images/blog/blog03.webp",
  "/assets/images/blog/blog-grid01.webp",
  "/assets/images/blog/blog-grid02.webp",
  "/assets/images/blog/blog-grid03.webp",
];

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  const seo = await getSeoData('seo_blog_grid');
  return createPageMetadata({
    ...seo,
    metaTitle: category ? `${category.name} | Blogs` : seo.metaTitle
  }, `/blog/category/${slug}`);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const [posts, categories, category] = await Promise.all([
    readActiveFrontendPosts(),
    readCategories(),
    findCategoryBySlug(slug)
  ]);
  
  if (!category) {
    notFound();
  }

  let published = posts.filter((p) => p.categoryId === category.id);
  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <Breadcrumb
        title={category.name}
        paths={[{ name: "Blogs", url: "/blog" }, { name: category.name }]}
        description="Explore Panzer IT resources, solutions and security insights designed to help your business stay informed and protected."
      />

      <section className="tv-blog-section space bg-light">
        <div className="container">
          <BlogGridClient 
            posts={published as any} 
            fallbackImages={fallbackImages} 
            categoryMap={Object.fromEntries(categoryById)} 
          />
        </div>
      </section>
    </>
  );
}
