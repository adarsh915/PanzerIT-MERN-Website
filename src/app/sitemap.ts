import { MetadataRoute } from 'next'
export const dynamic = 'force-dynamic';
import { readPosts } from '@/app/admin/posts/blogStore'
import { readBrands } from '@/app/admin/brands/brandStore'
import { readSolutions } from '@/app/admin/solutions/solutionStore'

const toValidDate = (dateString?: string) => {
  if (!dateString) return new Date();
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? new Date() : d;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const [posts, brands, solutions] = await Promise.all([
    readPosts(),
    readBrands(),
    readSolutions()
  ]);

  const publishedPosts = posts.filter(post => post.status === 'published');
  const activeBrands = brands.filter(brand => brand.status === 'active');
  const activeSolutions = solutions.filter(solution => solution.status === 'active');

  const blogUrls: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: toValidDate(post.publishedAt || post.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const brandUrls: MetadataRoute.Sitemap = activeBrands.map((brand) => ({
    url: `${siteUrl}/brand/${brand.slug}`,
    lastModified: toValidDate(brand.createdAt), // Brand doesn't have updatedAt in the interface usually, fallback to createdAt
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const solutionUrls: MetadataRoute.Sitemap = activeSolutions.map((solution) => ({
    url: `${siteUrl}/solution/${solution.slug}`,
    lastModified: toValidDate(solution.createdAt), // Solution fallback to createdAt
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/solution`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/brand`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/resources`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/download`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...solutionUrls,
    ...brandUrls,
    ...blogUrls,
  ]
}
