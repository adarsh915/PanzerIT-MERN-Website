import Image from "next/image";
import Link from "next/link";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // ISR: re-render at most once per minute
import { getHomepageData } from "./homepageStore";
import ServiceContactForm from "@/components/frontend/ServiceContactForm";
import { HeroSlider } from "@/components/frontend/HeroSlider";
import { NewHeroSlider } from "@/components/frontend/NewHeroSlider";
import { BrandSlider } from "@/components/frontend/BrandSlider";
import { createPageMetadata } from "@/utils/metadata";
import ServiceSliderArrows from "@/components/frontend/ServiceSliderArrows";
import { stripHtml } from "@/utils/sanitize";

const formatBlogDate = (value?: string) => {
    if (!value) return "";
    return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
};

const blogFallbackImages = [
    "/assets/images/blog/blog01.webp",
    "/assets/images/blog/blog02.webp",
    "/assets/images/blog/blog03.webp",
];

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getSeoData('seo_home');
    return createPageMetadata(seo, '/');
}

export default async function Page() {
    // Optimized: Single query with only needed data
    const { solutions: activeSolutions, posts: publishedPosts, brands: allBrands, homepageSettings } = await getHomepageData();

    // Create empty map for categories (posts now include categoryId but we don't need category names)
    const homeCategoryById = new Map();

    const chunkedSolutions = [];
    for (let i = 0; i < activeSolutions.length; i += 3) {
        chunkedSolutions.push(activeSolutions.slice(i, i + 3));
    }
    const lockAboutFeatures = [

        { icon: "fa-user-group", text: "30+ Years of Cybersecurity Expertise Enterprise Security | Data Protection | Backup & DR | Compliance" },
    ];

    const lockAboutFlow = [
        { icon: "fa-magnifying-glass", title: "Assess", text: "Identify vulnerabilities and security gaps." },
        { icon: "fa-shield-halved", title: "Protect", text: "Secure identities, systems and data." },
        { icon: "fa-eye", title: "Detect", text: "Spot threats and suspicious activity." },
        { icon: "fa-bolt", title: "Respond", text: "Contain incidents and reduce impact." },
        { icon: "fa-rotate-right", title: "Recover", text: "Restore operations and maintain continuity." },
    ];

    const achievementProtections = [
        { icon: "fa-id-card", title: "Identity &", text: "Access" },
        { icon: "fa-shield-halved", title: "Data", text: "Protection" },
        { icon: "fa-laptop", title: "Endpoint", text: "Security" },
        { icon: "fa-database", title: "Backup &", text: "DR" },
        { icon: "fa-clipboard-check", title: "Risk &", text: "Compliance" },
    ];

    const achievementCards = [
        {
            badge: "Partner Network",
            icon: "fa-buildings",
            value: "11+",
            title: "Technology Brands",
            text: "Trusted partnerships with leading technology innovators.",
            footer: [
                { icon: "fa-handshake", label: "Trusted Partnerships" },
                { icon: "fa-award", label: "Enterprise Grade Solutions" },
                { icon: "fa-shield-check", label: "Proven Excellence" },
            ],
        },
        {
            badge: "Our Solutions",
            icon: "fa-shield-check",
            value: "360°",
            title: "Security Solutions",
            text: "Comprehensive solutions designed to protect what matters most.",
            footer: [
                { icon: "fa-crosshairs", label: "Priority Support" },
                { icon: "fa-shield-check", label: "Advanced Threat Detection" },
                { icon: "fa-clock", label: "Rapid Incident Response" },
            ],
        },
    ];

    const defaultSlides = [
        {
            id: 'home-banner-1',
            eyebrow: 'AI Powered Protection',
            title: 'Cyber Resilience For',
            description: 'Anticipate threats, reduce cyber risk and keep your teams moving with clear security, backup and data protection support.',
            buttonText: 'Enquire Today',
            buttonUrl: '/contact',
            backgroundImage: '/assets/images/hero/try-banner1-v2.png',
            backgroundAlt: 'Digital lock cyber security banner',
        },
        {
            id: 'home-banner-2',
            eyebrow: 'Data Loss Prevention',
            title: 'Protect Sensitive Data',
            description: 'Discover risky activity, prevent accidental leaks and give leaders the visibility they need for confident decisions.',
            buttonText: 'View Solutions',
            buttonUrl: '/solution',
            backgroundImage: '/assets/images/hero/try-banner2-v2.png',
            backgroundAlt: 'Data protection cyber security banner',
        },
        {
            id: 'home-banner-3',
            eyebrow: 'Backup And Recovery',
            title: 'Recover Fast When Every',
            description: 'Build dependable recovery plans for endpoints, servers and cloud workloads so business stays available.',
            buttonText: 'Talk To Expert',
            buttonUrl: '/contact',
            backgroundImage: '/assets/images/hero/try-banner3-v2.png',
            backgroundAlt: 'Backup and recovery cyber security banner',
        },
    ];

    const bannerSlides = homepageSettings?.slides?.length > 0 ? homepageSettings.slides : defaultSlides;
    const homepageBrandTitle = homepageSettings?.brandPartnersTitle || 'BRAND PARTNERS';
    const homepageBrandPartners = homepageSettings?.brandPartners?.length > 0 ? homepageSettings.brandPartners : [
        { id: 'partner-scopd', name: 'Scopd', logo: '/assets/images/brands/01.png', logoAlt: 'Scopd logo' },
        { id: 'partner-falcongaze', name: 'Falcongaze', logo: '/assets/images/brands/02.png', logoAlt: 'Falcongaze logo' },
        { id: 'partner-somansa', name: 'Somansa', logo: '/assets/images/brands/03.webp', logoAlt: 'Somansa logo' },
        { id: 'partner-vembu', name: 'Vembu', logo: '/assets/images/brands/01.png', logoAlt: 'Vembu logo' },
    ];

    const marqueeItems = homepageSettings?.marqueeItems?.length > 0 ? homepageSettings.marqueeItems : [
        { id: 'marquee-1', text: 'ENTERPRISE CYBERSECURITY' },
        { id: 'marquee-2', text: 'DATA PROTECTION' },
        { id: 'marquee-3', text: '24x7 SUPPORT' },
        { id: 'marquee-4', text: 'ZERO TRUST ARCHITECTURE' },
        { id: 'marquee-5', text: 'VAPT & COMPLIANCE' },
    ];

    const heroVideoUrl = homepageSettings?.heroVideoUrl || '/assets/images/hero/banner.mp4';

    return (
        <div className="panzer-page-home">
            <style>{`
                @media (max-width: 991px) {
                    .panzer-page-home .panzer-cyber-shell {
                        display: grid !important;
                        grid-template-columns: 1fr !important;
                        padding-top: 100px !important;
                        padding-bottom: 60px !important;
                    }
                    .panzer-page-home .panzer-cyber-copy {
                        max-width: 100% !important;
                        text-align: center !important;
                    }
                    .panzer-page-home .panzer-cyber-actions {
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center;
                    }
                }
                /* Fix dropdown overlap in contact form */
                .tv-contact-section .contact-wrapper {
                    isolation: isolate;
                }
                .tv-contact-section .col-lg-6:first-child {
                    z-index: 10;
                    position: relative;
                }
                .tv-contact-section .col-lg-6:last-child {
                    z-index: 1;
                    position: relative;
                }
                .tv-contact-section .contact-right-content {
                    position: relative;
                    z-index: 10;
                    isolation: isolate;
                }
                .tv-contact-section .contact-left-thumb {
                    position: relative;
                    z-index: 1;
                }
                /* Product card icon — turn blue on hover (matches original SVG hover effect) */
                .tv-choose-section.style-6 .choose-box .icon img {
                    transition: filter 0.3s ease;
                }
                .tv-choose-section.style-6 .choose-box:hover .icon img {
                    filter: brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1600%) hue-rotate(210deg) brightness(105%) contrast(105%);
                }
                /* Dynamic Hero Settings Override */
                .panzer-page-home .panzer-cyber-title,
                .panzer-page-home .panzer-cyber-title span,
                .panzer-page-home .panzer-cyber-text {
                    color: var(--hero-text-color) !important;
                }
                .panzer-page-home .panzer-cyber-btn.primary {
                    background: var(--hero-btn-bg) !important;
                    border: none !important;
                }
            `}</style>
            <NewHeroSlider
                dynamicSlides={homepageSettings?.newHeroSlides}
                cta={homepageSettings?.newHeroCta}
                ctaUrl={homepageSettings?.newHeroCtaUrl}
                secondaryText={homepageSettings?.newHeroSecondaryText}
                secondaryUrl={homepageSettings?.newHeroSecondaryUrl}
                colors={homepageSettings?.newHeroColors}
                marqueeItems={marqueeItems}
            />
            {/* 
            <section className="tv-hero-section style-4 panzer-cyber-hero">
                <div className="panzer-cyber-slider-wrap">
                    <div className="panzer-cyber-video-bg" style={{
                        background: 'var(--hero-bg)',
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0
                    }}>
                        <div style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            background: 'radial-gradient(circle at 20% 50%, rgba(16, 83, 243, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 83, 243, 0.08) 0%, transparent 50%)',
                            zIndex: 1 
                        }}></div>
                    </div>

                    <div className="panzer-cyber-slider swiper" aria-label="Hero banner slider" style={{ zIndex: 2 }}>
                        <div className="swiper-wrapper">
                            {bannerSlides.map((slide: any, index: number) => (
                                <div key={slide.id || index} className="swiper-slide">
                                    <div className="panzer-cyber-slide">
                                        <div className="container panzer-cyber-shell">
                                            <div className="panzer-cyber-copy" data-swiper-parallax="-180">
                                                <span className="panzer-cyber-kicker">{slide.eyebrow}</span>
                                                <h1 className="panzer-cyber-title"><span>{slide.title} </span></h1>
                                                <p className="panzer-cyber-text">{slide.description}</p>
                                                <div className="panzer-cyber-actions">
                                                    <Link href={slide.buttonUrl || "#"} className="panzer-cyber-btn primary">
                                                        {slide.buttonText}
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="panzer-cyber-visual" style={{ opacity: 0, position: 'relative', minHeight: '400px' }}>
                                                <Image
                                                    className="panzer-floating-image"
                                                    src={slide.backgroundImage || "/assets/images/hero/try-banner1-v2.png"}
                                                    alt={slide.backgroundAlt || slide.title || "Hero Banner"}
                                                    fill
                                                    priority
                                                    sizes="(max-width: 991px) 100vw, 50vw"
                                                    style={{ objectFit: "contain", zIndex: 10 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="panzer-cyber-controls">
                        <div className="panzer-cyber-nav">
                            <button className="panzer-cyber-prev" type="button" aria-label="Previous slide">
                                <i className="fa-light fa-arrow-left-long"></i>
                            </button>
                            <button className="panzer-cyber-next" type="button" aria-label="Next slide">
                                <i className="fa-light fa-arrow-right-long"></i>
                            </button>
                        </div>
                    </div>
                    <div className="panzer-cyber-pagination" aria-label="Hero slider pagination" style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bottom: 'clamp(24px, 3.2vw, 38px)',
                        zIndex: 5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '14px',
                        width: 'auto'
                    }}></div>
                    <HeroSlider />
                </div>
            </section>
            */}













            <section className="tv-service-section bg-light position-relative overflow-hidden style-4">
                <div className="tv-service-inner space position-relative overflow-hidden bg-light2 mx-20 ml-mx-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="service-title-area d-flex justify-content-between sm-flex-column sm-mb-30">

                                    <div className="title-wrap " data-wow-duration="1.5s" data-wow-delay=".4s">
                                        <div className="sub-title-2 text-white two">Solutions</div>
                                        <h2 className="panzer-static-sec-title text-white">Panzer IT Security, Backup <br />and Data Protection
                                            Solutions
                                        </h2>
                                    </div>
                                    <div className="service-btn-wrapper">
                                        <Link href="/solution" className="theme-btn br-30 service-view-all-btn panzer-static-service-btn">
                                            <span className="link-effect">
                                                <span className="effect-1">View All</span>
                                                <span className="effect-1">View All</span>
                                            </span>
                                            <span className="arrow-all">
                                                <i>
                                                    <svg width="16" height="19" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="var(--theme-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <svg width="16" height="19" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="var(--theme-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </i>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row gy-30">
                            <div className="col-lg-12">
                                <div className="service-slider swiper panzer-scroll-service">
                                    <div className="swiper-wrapper panzer-service-rows-ready">
                                        {chunkedSolutions.map((chunk, chunkIndex) => (
                                            // To re-enable animation: add class `${chunkIndex < chunkedSolutions.length - 1 ? 'service-item-pin' : ''}` below
                                            <div key={chunkIndex} className="panzer-service-row service-item-wrap">
                                                {chunk.map((solution, index) => (
                                                    <div className="swiper-slide" key={solution.id}>
                                                        <div className={`service-box-four ${index === 1 ? 'current' : ''}`}>
                                                            <div className="inner">
                                                                <div className="image-box">
                                                                    <div className="thumb overlay-anim4">
                                                                        <Image src={solution.image || "/assets/images/service/malware.webp"} alt={solution.imageAlt || solution.title} width={612} height={459} sizes="100vw" style={{ width: "100%", height: "auto" }} />
                                                                    </div>
                                                                    {solution.logo && (
                                                                        <div className="service-icon">
                                                                            <Image width={46} height={46} src={solution.logo} alt={solution.logoAlt || "Icon"} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="content">
                                                                    <h4 className="title">
                                                                        <Link href={`/solution/${solution.slug}`}>{solution.title}</Link>
                                                                    </h4>
                                                                    <p className="text">
                                                                        {(() => {
                                                                            const text = solution.subtitle || (solution.description || '').replace(/<[^>]*>?/gm, '');
                                                                            return text.length > 120 ? text.substring(0, 120).trim() + '...' : text;
                                                                        })()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <ServiceSliderArrows />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* brand */}

            <section className="panzer-brand-partners-section">
                <div className="panzer-cyber-brand-strip">

                    <div className="tv-brands-section style-3 position-relative z-3">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12 text-center">
                                    <div className="title-wrap" style={{ marginBottom: '25px' }}>
                                        <div className="sub-title-2">{homepageBrandTitle}</div>
                                    </div>
                                    <div className="sponsors-outer brand-outher panzer-cyber-brand-panel">
                                        <div className="brands-slider-three swiper">
                                            <div className="swiper-wrapper">
                                                {homepageBrandPartners
                                                    .filter((partner: any) => partner.logo)  // ← only render if logo exists
                                                    .map((partner: any, index: number) => (
                                                        <div className="swiper-slide" key={partner.id || index}>
                                                            <div className="brand-item">
                                                                <div className="image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', width: '150px' }}>
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={partner.logo}
                                                                        alt={partner.logoAlt || partner.name}
                                                                        style={{ width: "auto", height: "auto", maxWidth: "150px", maxHeight: "40px", objectFit: "contain" }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className="panzer-brand-nav" aria-label="Brand partners slider controls">
                                            <button className="panzer-brand-prev" type="button" aria-label="Previous brand">
                                                <i className="fa-light fa-arrow-left-long"></i>
                                            </button>
                                            <button className="panzer-brand-next" type="button" aria-label="Next brand">
                                                <i className="fa-light fa-arrow-right-long"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <BrandSlider />
                    </div>
                </div>
            </section>




            <section className="tv-about-section style-4 space bg-light panzer-home-about-section">
                <div className="container">
                    <div className="panzer-lock-about-grid">
                        <div className="panzer-lock-about-copy">
                            <div className="panzer-lock-about-pill">Who We Are</div>
                            <h2 className="panzer-lock-about-title no-title-animation">Secure Data Ensure Availability Enable Business</h2>
                            <p className="panzer-lock-about-text">Panzer IT helps organizations secure identities, infrastructure and critical data through integrated cybersecurity, data protection, backup, disaster recovery and compliance solutions.
                            </p>
                            <div className="panzer-lock-about-features">
                                {lockAboutFeatures.map((item) => (
                                    <div className="panzer-lock-feature" key={item.text}>
                                        <span className="panzer-lock-feature-icon">
                                            <i className={`fa-light ${item.icon}`}></i>
                                        </span>
                                        <h3>{item.text}</h3>
                                    </div>
                                ))}
                            </div>

                        </div>

                        <div className="panzer-lock-about-visual">
                            <div className="panzer-lock-network" aria-hidden="true">
                                <span></span><span></span><span></span><span></span><span></span>
                                <span></span><span></span><span></span>
                            </div>
                            <Image className="panzer-lock-image" src="/assets/images/hero/create.png" alt="Blue cyber security lock with shield" width={1024} height={1536} sizes="(max-width: 991px) 80vw, 36vw" />
                        </div>

                        <div className="panzer-lock-about-flow">
                            {lockAboutFlow.map((item) => (
                                <div className="panzer-lock-flow-card" key={item.title}>
                                    <span className="panzer-lock-flow-dot" aria-hidden="true"></span>
                                    <div className="panzer-lock-flow-icon">
                                        <i className={`fa-light ${item.icon}`}></i>
                                    </div>
                                    <div>
                                        <h3>{item.title}</h3>
                                        <p>{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            <section className="tv-achivement-section bg-light overflow-hidden panzer-home-achievement-section">
                <div className="tv-achivement-inner panzer-achievement-modern position-relative overflow-hidden bg-light2 mx-20 ml-mx-0">
                    <div className="container">
                        <div className="panzer-achievement-grid">
                            <div className="panzer-achievement-copy">
                                {/* <div className="panzer-achievement-pill">
                                       
                                        <span>Panzer IT</span>
                                    </div> */}
                                <h2 className="panzer-achievement-title no-title-animation">Continuous <span>Data Security,</span> Accessibility & Availability</h2>
                                <p className="panzer-achievement-text">From Endpoint Security and IAM/PAM to DLP, Backup, Disaster Recovery and Compliance, Panzer IT helps organizations stay secure, resilient and compliant. With decades of cybersecurity expertise, we help protect identities, endpoints, networks, cloud workloads and critical business data while ensuring information remains secure, accessible and available. With a client-first approach and industry-leading tools, we deliver security strategies built for long-term resilience. Our proactive monitoring and rapid response capabilities mean threats are identified and neutralized before they can disrupt your operations.Backed by certified experts and industry best practices, we ensure your organization stays ahead of evolving cyber risks — today and in the future.</p>
                                <div className="panzer-protection-strip" aria-label="Panzer IT protection areas">
                                    {achievementProtections.map((item) => (
                                        <div className="panzer-protection-item" key={`${item.title}-${item.text}`}>
                                            <span className="panzer-protection-icon">
                                                <i className={`fa-light ${item.icon}`}></i>
                                                {/* <b><i className="fa-solid fa-shield-check"></i></b> */}
                                            </span>
                                            <strong>{item.title}</strong>
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="panzer-achievement-cards">
                                {achievementCards.map((card) => (
                                    <div className="panzer-achievement-card" key={card.title}>
                                        <div className="panzer-achievement-card-visual">
                                            <span>
                                                <i className={`fa-light ${card.icon}`}></i>
                                            </span>
                                        </div>
                                        <div className="panzer-achievement-card-body">
                                            <div className="panzer-achievement-card-badge">{card.badge}</div>
                                            <div className="panzer-achievement-value">{card.value}</div>
                                            <h3>{card.title}</h3>
                                            <p>{card.text}</p>
                                        </div>
                                        <div className="panzer-achievement-card-footer">
                                            {card.footer.map((item) => (
                                                <div className="panzer-achievement-footer-item" key={item.label}>
                                                    <i className={`fa-light ${item.icon}`}></i>
                                                    <span>{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>







            <section className="tv-choose-section style-6 space bg-dark position-relative resource-page-choose">
                <div className="bg image"><Image src="/assets/images/choose/hm8-bg01.webp" alt="Background pattern" width={1920} height={886} sizes="100vw" style={{ width: "100%" }} /></div>
                <div className="container">

                    <div className="title-wrap text-center three">
                        <h2 className="sec-title text-white no-title-animation" style={{ margin: '0px' }}>Trusted Technology Partners</h2>
                        <h4 className="text-white" style={{ opacity: 0.75, lineHeight: 1.6 }}>Best-of-breed cybersecurity and data protection technologies carefully selected to protect what matters most.</h4>
                    </div>

                    {(() => {
                        const featuredBrands = allBrands.filter((b: any) => b.featured).slice(0, 6);
                        const leftBrands = featuredBrands.slice(0, 3);
                        const rightBrands = featuredBrands.slice(3, 6);

                        return (
                            <div className="row gy-30">
                                <div className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="choose-left">
                                        {leftBrands.map((brand: any, i: number) => {
                                            return (
                                                <Link key={brand.id} href={`/brand/${brand.slug}`} className={`choose-box panzer-choose-link${i < leftBrands.length - 1 ? ' mb-40' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <h6 style={{ margin: 0, color: 'white' }}>{brand.name}</h6>
                                                    </div>
                                                    {brand.homepageTagline && (
                                                        <p style={{ fontSize: '16px', margin: 0, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{stripHtml(brand.homepageTagline)}</p>
                                                    )}
                                                    {brand.homepageSubTagline && (
                                                        <p style={{ fontSize: '12px', margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>{stripHtml(brand.homepageSubTagline)}</p>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="col-lg-4 col-md-6 d-none d-lg-block">
                                    <div className="choose-middle">
                                        <div className="ai-box">
                                            <Image className="spin2" src="/assets/images/choose/hm8-ai.webp" alt="AI Security illustration" width={424} height={424} sizes="100vw" style={{ width: "100%", height: "auto" }} />
                                            <div className="circle"><h1>360°</h1></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="choose-right">
                                        {rightBrands.map((brand: any, i: number) => {
                                            return (
                                                <Link key={brand.id} href={`/brand/${brand.slug}`} className={`choose-box panzer-choose-link${i < rightBrands.length - 1 ? ' mb-40' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <h6 style={{ margin: 0, color: 'white' }}>{brand.name}</h6>
                                                    </div>
                                                    {brand.homepageTagline && (
                                                        <p style={{ fontSize: '16px', margin: 0, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{stripHtml(brand.homepageTagline)}</p>
                                                    )}
                                                    {brand.homepageSubTagline && (
                                                        <p style={{ fontSize: '12px', margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>{stripHtml(brand.homepageSubTagline)}</p>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </section>



            {/* <section className="tv-contact-section style-4 z-1">
                <div className="tv-contact-inner space position-relative overflow-hidden bg-light2 ml-mx-0">
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




            <div className="tv-marquee-section bg-light position-relative">
                <div className="tv-marquee-inner ml-mx-0 position-relative">
                    <div className="container-fluid p-0 overflow-hidden">
                        <div className="slider__marquee clearfix br-0 marquee-wrap style-2">
                            <div className="panzer-next-marquee-track">
                                <ul className="marquee__group">
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        Endpoint Security</li>
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        Backup & Disaster Recovery</li>
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        Data Loss Prevention (DLP)</li>
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        Vulnerability Assessment & VAPT</li>
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        IAM, PAM & Network Security</li>
                                </ul>
                                <ul className="marquee__group" aria-hidden="true">
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        Endpoint Security</li>
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        Backup & Disaster Recovery</li>
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        Data Loss Prevention (DLP)</li>
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        Vulnerability Assessment & VAPT</li>
                                    <li className="item m-item"><Image width={1098} height={960} className="icon" src="/assets/images/icons/icone2.png" alt="Security badge icon" />
                                        IAM, PAM & Network Security</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>





            <section className="tv-blog-section space bg-color2">
                <div className="container">

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="service-title-area d-flex justify-content-between align-items-end sm-flex-column sm-mb-30 pb-30">
                                <div className="title-wrap mb-0">
                                    <div className="sub-title-2  text-theme">Latest
                                        Blogs
                                    </div>
                                    <h2 className="sec-title no-title-animation mb-0">Write-ups, Tech Stuff &amp; News </h2>
                                </div>
                                <div className="service-btn-wrapper mt-sm-20">
                                    <Link href="/blog" className="theme-btn br-30 service-view-all-btn">
                                        <span className="link-effect">
                                            <span className="effect-1">View All</span>
                                            <span className="effect-1">View All</span>
                                        </span>
                                        <span className="arrow-all">
                                            <i>
                                                <svg width="16" height="19" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="var(--theme-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <svg width="16" height="19" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="var(--theme-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </i>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row gy-25 latest-blog-row">
                        {publishedPosts.length === 0 ? (
                            <div className="col-12 text-center">
                                <p>No blog posts published yet. <Link href="/blog">View all posts</Link></p>
                            </div>
                        ) : (
                            publishedPosts.map((post, index) => {
                                const imgSrc = post.image || blogFallbackImages[index % blogFallbackImages.length];
                                const categoryName = post.categoryId ? (homeCategoryById.get(post.categoryId) || "") : "";
                                const dateStr = formatBlogDate(post.publishedAt || post.createdAt);
                                return (
                                    <div key={post.id} className="col-lg-4 col-md-6 col-sm-6">
                                        <article className="blog-single-box h-100">
                                            <div className="inner-box h-100 d-flex flex-column">
                                                <div className="blog-image" style={{ height: '284px', overflow: 'hidden', position: 'relative' }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={imgSrc}
                                                        alt={post.imageAlt || post.title}
                                                        width={392}
                                                        height={284}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                                                    />
                                                    <div className="category-tag"><span></span>{categoryName || dateStr}</div>
                                                </div>
                                                <div className="blog-content d-flex flex-column flex-grow-1">
                                                    <h4 className="title"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h4>
                                                    <div className="pt-25 pb-30 mt-auto"><div className="border dark"></div></div>
                                                    <div className="blog-meta">
                                                        <Link href={`/blog/${post.slug}`} className="continue-reading">Read More</Link>
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
                            })
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
