import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { BrandGridClient } from "@/components/frontend/BrandGridClient";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { readActiveFrontendBrands, readCategories, findCategoryBySlug } from "@/app/admin/brands/brandStore";
import { createPageMetadata } from '@/utils/metadata';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const fallbackLogos = [
  "/assets/images/brands/01.png",
  "/assets/images/brands/02.png",
  "/assets/images/brands/03.webp",
  "/assets/images/brands/04.webp",
  "/assets/images/brands/05.png",
  "/assets/images/brands/06.png",
  "/assets/images/brands/07.png",
  "/assets/images/brands/08.png",
  "/assets/images/brands/09.png",
  "/assets/images/brands/09.png",
];

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  const seo = await getSeoData('seo_brand');
  return createPageMetadata({
    ...seo,
    metaTitle: category ? `${category.name} | Brands` : seo.metaTitle
  }, `/brand/category/${slug}`);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const [brands, categories, category] = await Promise.all([
    readActiveFrontendBrands(),
    readCategories(),
    findCategoryBySlug(slug)
  ]);
  
  if (!category) {
    notFound();
  }

  const activeBrands = brands.filter((b) => b.category === category.name);

  return (
    <>
      <Breadcrumb
        title={category.name}
        paths={[{ name: "Brands", url: "/brand" }, { name: category.name }]}
        description="Explore Panzer IT resources, solutions and security insights designed to help your business stay informed and protected."
      />

      <section className="tv-service-section space-bottom inner style-2 bg-light pt-100 panzer-brand-page">
        <div className="tv-service-inner position-relative overflow-hidden mx-30 ml-mx-0">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <div className="title-wrap two white" data-wow-duration="2s" data-wow-delay=".0s">
                  <div className="sub-title-2">Brands</div>
                  <h2 className="sec-title text-dark no-title-animation">
                    {category.name}
                  </h2>
                </div>
              </div>
            </div>

            <BrandGridClient brands={activeBrands} fallbackLogos={fallbackLogos} />
          </div>
        </div>
      </section>
    </>
  );
}
