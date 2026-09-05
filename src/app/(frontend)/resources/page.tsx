import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import Image from "next/image";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import Link from "next/link";
import ServiceContactForm from "@/components/frontend/ServiceContactForm";
import ResourcesFilterClient from "../../../components/frontend/ResourcesFilterClient";
import { SolutionDetailSticky } from "@/components/frontend/SolutionDetailSticky";
import { readActiveFrontendResources, readResourceCategories } from "@/app/admin/resources/resourceStore";
import { readActiveQuestionnaires } from "@/app/admin/resources/questionnaires/questionnaireStore";
import { createPageMetadata } from '@/utils/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('seo_resources');
  return createPageMetadata(seo, '/resources');
}

export default async function Page() {
    // Fetch resources and categories dynamically from database
    const dbResources = await readActiveFrontendResources();
    const dbCategories = await readResourceCategories();
    const questionnaires = await readActiveQuestionnaires();
    
    // Map to frontend expected format
    const resources = dbResources.map(r => ({
        id: r.id,
        title: r.title || '',
        description: r.description || '',
        image: r.image || '/assets/images/service/hm5-icon01.webp',
        imageWidth: 46,
        imageHeight: 46,
        link: r.fileUrl || '',
        category: r.category || 'General',
    }));

    return (
        <>
            <SolutionDetailSticky />
            <Breadcrumb
                title="Resources"
                paths={[{ "name": "Resources" }]}
                description="Explore Panzer IT resources, solutions and security insights designed to help your business stay informed and protected."
            />

            <section className="panzer-solution-detail-section bg-light space">
                <div className="container">
                    <div className="row gy-30 align-items-center">
                        <div className="col-lg-12">
                            <div className="service-title-area d-flex justify-content-between sm-flex-column sm-mb-30">
                                <div className="title-wrap" data-wow-duration="1.5s" data-wow-delay=".4s">
                                    <div className="sub-title-2 text-theme">Resources</div>
                                    <h2 className="sec-title no-title-animation">Panzer IT resources, product presentations <br /> and technical resources</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Client-side filter with dynamic data */}
                    <ResourcesFilterClient items={resources} categories={dbCategories} questionnaires={questionnaires} />
                </div>
            </section>
        </>
    );
}
