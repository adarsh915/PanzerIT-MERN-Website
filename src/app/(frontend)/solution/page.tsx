import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { SolutionsGrid } from "@/components/frontend/SolutionsGrid";
import Image from "next/image";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import ServiceContactForm from "@/components/frontend/ServiceContactForm";
import { createPageMetadata } from '@/utils/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getSeoData('seo_solution');
    return createPageMetadata(seo, '/solution');
}

export default async function Page() {
    return (
        <>
            <Breadcrumb
                title="Solutions"
                paths={[{ "name": "Solutions" }]}
                description="Explore Panzer IT resources, solutions and security insights designed to help your business stay informed and protected."
            />

            <section className="tv-service-section space-bottom inner style-2 bg-light pt-100 ">
                <div className="tv-service-inner position-relative overflow-hidden mx-30 ml-mx-0">
                    <div className="container">

                        <div className="row">
                            <div className="col-lg-12 text-center">
                                <div className="title-wrap two white" data-wow-duration="2s" data-wow-delay=".0s">
                                    <div className="sub-title-2">Solutions</div>
                                    <h2 className="sec-title text-dark no-title-animation">Security, Backup and Data Protection <br />Solutions </h2>
                                </div>
                            </div>
                        </div>
                        <SolutionsGrid />
                    </div>
                </div>
            </section>

            <section className="tv-process-section bg-light position-relative">
                <div className="p-top-center z-1 wow slideInTop">
                    <Image src="/assets/images/process/hm1-shape01.png" alt="Decorative process graphic" width={1026} height={295} sizes="100vw" style={{ width: "100%", height: "auto" }} />
                </div>
                <div className="process-inner bg-theme3  mx-30 ml-mx-0 br_bl-30 br_br-30 ml-br-0  space  overflow-hidden xxl-br-0 position-relative">
                    <div className="container position-relative">

                        <div className="row">
                            <div className="col-lg-12">
                                <div className="process-title mt--25">
                                    <h2 className="text-white text-center">HOW WE WORK</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row gy-30">
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="tv-process-item wow fadeInRightBig" data-wow-delay=".2s">
                                    <h4 className="title-text">STEP 01</h4>
                                    <div className="process-box">
                                        <div className="icon"><Image src="/assets/images/process/hm1-icon1.webp" alt="Consult and Understand step icon" width={40} height={42} sizes="100vw" style={{ width: "100%", height: "auto" }} /></div>
                                        <h3 className="title">Consult & Understand</h3>
                                        <p>We study your infrastructure, data flow, risks and compliance needs before recommending any solution.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="tv-process-item wow fadeInRightBig" data-wow-delay=".3s">
                                    <h4 className="title-text">STEP 02</h4>
                                    <div className="process-box">
                                        <div className="icon"><Image src="/assets/images/process/hm1-icon2.webp" alt="Assess and Recommend step icon" width={44} height={44} sizes="100vw" style={{ width: "100%", height: "auto" }} /></div>
                                        <h3 className="title">Assess & Recommend</h3>
                                        <p>Our team maps the right mix of security, backup and monitoring technologies for your environment.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="tv-process-item  wow fadeInRightBig" data-wow-delay=".4s">
                                    <h4 className="title-text">STEP 03</h4>
                                    <div className="process-box">
                                        <div className="icon"><Image src="/assets/images/process/hm1-icon3.webp" alt="Deploy and Integrate step icon" width={46} height={46} sizes="100vw" style={{ width: "100%", height: "auto" }} /></div>
                                        <h3 className="title">Deploy & Integrate</h3>
                                        <p>We implement the chosen controls with the right configuration, protection layers and operational alignment.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="tv-process-item wow fadeInRightBig" data-wow-delay=".5s">
                                    <h4 className="title-text">STEP 04</h4>
                                    <div className="process-box">
                                        <div className="icon"><Image src="/assets/images/process/hm1-icon4.webp" alt="Support and Optimize step icon" width={35} height={45} sizes="100vw" style={{ width: "100%", height: "auto" }} /></div>
                                        <h3 className="title">Support & Optimize</h3>
                                        <p>Continuous secure data accessibility and availability stays strong through ongoing tuning and support.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* <section className="tv-contact-section style-4 z-1">
                <div className="tv-contact-inner space position-relative overflow-hidden bg-light2 mx-20 ml-mx-0">
                    <div className="container">
                        <div className="row gy-30 contact-wrapper align-items-stretch">
                            <div className="col-lg-6">
                                <div className="contact-right-content">
                                    <div className="title-wrap text-center">
                                        <div className="sub-title-2 text-theme">Contact
                                            Us</div>
                                        <h2 className="sec-title no-title-animation">Feel free to touch base <br /> with Panzer IT</h2>
                                    </div>
                                    <div className="contact-form style-4">
                                        <ServiceContactForm />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="contact-left-thumb overflow-hidden">
                                    <figure className="panzer-static-img">
                                        <Image src="/assets/images/hero/deal.png" alt="Business deal discussion" width={1254} height={1254} sizes="100vw" style={{ width: "100%", height: "auto" }} />
                                    </figure>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}
        </>
    );
}
