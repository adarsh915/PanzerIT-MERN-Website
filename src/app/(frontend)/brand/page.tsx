import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { readActiveFrontendBrands } from "@/app/admin/brands/brandStore";
import { BrandGridClient } from "@/components/frontend/BrandGridClient";
import { createPageMetadata } from '@/utils/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

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

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('seo_brand');
  return createPageMetadata(seo, '/brand');
}

export default async function Page() {
  const activeBrands = await readActiveFrontendBrands();

  return (
    <>
      <Breadcrumb
        title="Brands"
        paths={[{ name: "Brands" }]}
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
                    Trusted Security, Backup and Data Protection <br />Brands with Panzer IT
                  </h2>
                </div>
              </div>
            </div>

            <div className="row gy-30 mb-40">
              <div className="col-lg-5">
                <div className="panzer-presentation-card wow fadeInUp" data-wow-delay=".15s">
                  <div className="panzer-presentation-icon">
                    <Image
                      src="/assets/images/icons/pdf.png"
                      alt="Presentation file"
                      width={18}
                      height={24}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  <h3 className="title text-dark">Panzer IT Presentation</h3>
                  <p className="text mb-20">
                    Explore Panzer IT&apos;s brand portfolio across data leak prevention, employee monitoring,
                    vulnerability assessment, endpoint security, secure remote access and backup solutions.
                  </p>

                  <Link href="/resources" className="theme-btn panzer-static-read-btn">
                    <span className="link-effect">
                      <span className="effect-1">VIEW RESOURCE</span>
                      <span className="effect-1">VIEW RESOURCE</span>
                    </span>
                    <i className="fa-solid fa-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="panzer-presentation-card wow fadeInUp" data-wow-delay=".2s">
                  <h3 className="title text-dark">Brand Focus Areas</h3>
                  <p className="text mb-0">
                    Panzer IT represents and supports specialist cyber security and business continuity brands for DLP,
                    user behavior analytics, anti-malware, backup and disaster recovery, VAPT, IAM, PAM, secure remote
                    access and endpoint protection programs.
                  </p>
                  <div className="panzer-tag-cloud">
                    <span>#DLP</span>
                    <span>#Data Leak Prevention</span>
                    <span>#Employee Monitoring</span>
                    <span>#User Behavior Analysis</span>
                    <span>#Anti Malware</span>
                    <span>#Backup & Disaster Recovery</span>
                    <span>#VAPT</span>
                    <span>#Remote Access</span>
                    <span>#EDR</span>
                    <span>#Endpoint Security</span>
                    <span>#Risk Management</span>
                    <span>#Compliance</span>
                  </div>
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
