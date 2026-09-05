import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { SolutionsGridClient } from "@/components/frontend/SolutionsGridClient";
import Image from "next/image";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { readActiveFrontendSolutions, readCategories, findCategoryBySlug } from "@/app/admin/solutions/solutionStore";
import { createPageMetadata } from '@/utils/metadata';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  const seo = await getSeoData('seo_solution');
  return createPageMetadata({
    ...seo,
    metaTitle: category ? `${category.name} | Solutions` : seo.metaTitle
  }, `/solution/category/${slug}`);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const [solutions, categories, category] = await Promise.all([
    readActiveFrontendSolutions(),
    readCategories(),
    findCategoryBySlug(slug)
  ]);
  
  if (!category) {
    notFound();
  }

  const published = solutions.filter((s) => s.category === category.name);

  return (
    <>
      <Breadcrumb
        title={category.name}
        paths={[{ name: "Solutions", url: "/solution" }, { name: category.name }]}
        description="Explore Panzer IT resources, solutions and security insights designed to help your business stay informed and protected."
      />

      <section className="tv-service-section space-bottom inner style-2 bg-light pt-100 ">
        <div className="tv-service-inner position-relative overflow-hidden mx-30 ml-mx-0">
          <div className="container">

            <div className="row">
              <div className="col-lg-12 text-center">
                <div className="title-wrap two white" data-wow-duration="2s" data-wow-delay=".0s">
                  <div className="sub-title-2">Solutions</div>
                  <h2 className="sec-title text-dark no-title-animation">
                    {category.name}
                  </h2>
                </div>
              </div>
            </div>
            <SolutionsGridClient solutions={published} />
          </div>
        </div>
      </section>
    </>
  );
}
