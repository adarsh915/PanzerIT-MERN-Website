"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './NewHeroSlider.module.css';

const ICONS: Record<string, React.ReactNode> = {
  lock: (
    <>
      <path d="M6 11V7a6 6 0 0112 0v4" />
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
      <circle cx="8" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  shieldBolt: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M13 8l-4 6h3l-1 4 4-6h-3l1-4z" fill="currentColor" stroke="none" />
    </>
  ),
  docLock: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <rect x="9.5" y="13" width="5" height="4" rx="1" />
      <path d="M10.5 13v-1.4a1.5 1.5 0 013 0V13" />
    </>
  ),
  seal: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13l-2 8 5-3 5 3-2-8" />
      <path d="M9.5 9l1.7 1.7L14.5 7" />
    </>
  ),
  fortress: (
    <>
      <path d="M4 21V9l2-2v3h2V5l2-2 2 2v5h2V7l2-2v3l2 2v12H4z" />
      <path d="M9 21v-5h6v5" />
    </>
  )
};

const defaultSlides = [
  {
    eyebrow: "Identity & Access",
    titleLine1: "Control",
    titleLine2: "Who Gets In",
    desc: "IAM, PAM, DBAM & MFA solutions that enforce least-privilege across users, admins, and critical databases.",
    tags: ["IAM", "PAM", "DBAM", "Zero Trust", "MFA"],
    cta: "Know More",
    icon: "lock",
    orbit: [
      { label: "SSO", icon: "lock" },
      { label: "MFA", icon: "shieldBolt" },
      { label: "RBAC", icon: "eye" },
      { label: "IAM", icon: "server" },
      { label: "PAM", icon: "seal" },
      { label: "DBAM", icon: "docLock" }
    ],
    accent: "#061153"
  },
  {
    eyebrow: "Data Resilience",
    titleLine1: "Your Data Survives",
    titleLine2: "No Matter What Hits",
    desc: "Enterprise Backup, DR, Disaster Failover, Data Availability — because data loss is not an option.",
    tags: ["Backup", "Disaster Failover", "Data Loss Prevention"],
    cta: "Explore Solution",
    icon: "server",
    orbit: [
      { label: "Snapshots", icon: "server" },
      { label: "Failover", icon: "shieldBolt" },
      { label: "Off-site", icon: "lock" },
      { label: "Backup", icon: "docLock" },
      { label: "DR", icon: "seal" },
      { label: "Availability", icon: "eye" }
    ],
    accent: "#FFB648"
  },
  {
    eyebrow: "Insider Threat Detection",
    titleLine1: "See Everything",
    titleLine2: "Know Every Risk",
    desc: "UEBA & Employee Monitoring that spots anomalies and insider threats before damage is done.",
    tags: ["UEBA", "Employee Monitoring", "Insider Risk"],
    cta: "More Details",
    icon: "eye",
    orbit: [
      { label: "Anomaly", icon: "eye" },
      { label: "Insider Risk", icon: "shieldBolt" },
      { label: "Behavior", icon: "seal" },
      { label: "UEBA", icon: "server" },
      { label: "Monitoring", icon: "lock" },
      { label: "Alerts", icon: "docLock" }
    ],
    accent: "#FF5D73"
  },
  {
    eyebrow: "Threat Defence",
    titleLine1: "Stop Threats At",
    titleLine2: "Every Layer",
    desc: "Anti-malware, EDR, XDR and SIEM — unified threat detection and response across your entire environment.",
    tags: ["Anti-malware", "EDR", "XDR", "SIEM"],
    cta: "Read More",
    icon: "shieldBolt",
    orbit: [
      { label: "EDR", icon: "shieldBolt" },
      { label: "XDR", icon: "eye" },
      { label: "SIEM", icon: "server" },
      { label: "Anti-malware", icon: "lock" },
      { label: "Detection", icon: "seal" },
      { label: "Response", icon: "docLock" }
    ],
    accent: "#2b72ff"
  },
  {
    eyebrow: "Data Protection",
    titleLine1: "Stop Data Leaks",
    titleLine2: "Before It Starts",
    desc: "Data Leak Prevention — Endpoint & Network DLP, Enterprise DLP across endpoint and cloud.",
    tags: ["DLP", "Data Discovery", "Encryption"],
    cta: "Explore",
    icon: "docLock",
    orbit: [
      { label: "DLP", icon: "docLock" },
      { label: "Encrypt", icon: "lock" },
      { label: "Discover", icon: "eye" },
      { label: "Endpoint", icon: "server" },
      { label: "Network", icon: "shieldBolt" },
      { label: "Cloud", icon: "seal" }
    ],
    accent: "#17C3B2"
  },
  {
    eyebrow: "Compliance & Assurance",
    titleLine1: "Audit-Ready",
    titleLine2: "Regulation-Proof",
    desc: "VAPT, security audits and compliance management for DPDP, GDPR, RBI, SEBI & other frameworks.",
    tags: ["VAPT", "DPDP", "GDPR", "RBI", "SEBI"],
    cta: "Talk to an Expert",
    icon: "seal",
    orbit: [
      { label: "DPDP", icon: "seal" },
      { label: "GDPR", icon: "docLock" },
      { label: "RBI/SEBI", icon: "shieldBolt" },
      { label: "VAPT", icon: "eye" },
      { label: "Audit", icon: "lock" },
      { label: "Reports", icon: "server" }
    ],
    accent: "#FFB648"
  },
  {
    eyebrow: "Panzer IT",
    titleLine1: "Enterprise Security",
    titleLine2: "Without Compromise",
    desc: "Securing what matters most — one platform across identity, data, insider risk, threats and compliance.",
    tags: ["Cyber Defence", "Data Protection", "Business Continuity"],
    cta: "Talk to an Expert",
    icon: "fortress",
    orbit: [
      { label: "24x7 SOC", icon: "fortress" },
      { label: "Trusted", icon: "seal" },
      { label: "Compliant", icon: "docLock" },
      { label: "Unified", icon: "shieldBolt" },
      { label: "Secure", icon: "lock" },
      { label: "Resilient", icon: "server" }
    ],
    accent: "#FF5D73"
  }
];

const ORBIT_FACTORS = [
  { x: 0, y: -1 },
  { x: 0.866, y: -0.5 },
  { x: 0.866, y: 0.5 },
  { x: 0, y: 1 },
  { x: -0.866, y: 0.5 },
  { x: -0.866, y: -0.5 }
];

// One distinct dark bg per slide — cycles if there are more slides than colors
const BADGE_COLORS = [
  '#061153', // deep navy    (slide 1 – Identity & Access)
  '#1a0a2e', // dark indigo  (slide 2 – Data Resilience)
  '#0d2318', // dark forest  (slide 3 – Insider Threat)
  '#2d0d0d', // dark crimson (slide 4 – Threat Defence)
  '#0a1f2d', // dark teal    (slide 5 – Data Protection)
  '#1c1a04', // dark olive   (slide 6 – Compliance)
  '#1a0e28', // deep plum    (slide 7 – Enterprise)
];

export function NewHeroSlider({ dynamicSlides, cta, ctaUrl, secondaryText, secondaryUrl, colors, marqueeItems }: {
  dynamicSlides?: any[]
  cta?: string
  ctaUrl?: string
  secondaryText?: string
  secondaryUrl?: string
  colors?: Record<string, string>
  marqueeItems?: any[]
}) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Build CSS var overrides from colors prop
  const colorVars = colors
    ? Object.fromEntries(Object.entries(colors).map(([k, v]) => [k, v]))
    : {};

  const finalSlides = dynamicSlides && dynamicSlides.length > 0 ? dynamicSlides : defaultSlides;
  const slideCount = finalSlides.length;

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [index, isHovered]);

  const handleNext = () => {
    setIsTransitioning(true);
    setIndex((prev) => (prev + 1) % slideCount);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setIndex((prev) => (prev - 1 + slideCount) % slideCount);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const handleGoTo = (i: number) => {
    if (index === i) return;
    setIsTransitioning(true);
    setIndex(i);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const currentSlide = finalSlides[index];

  return (
    <div style={colorVars as React.CSSProperties}>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img src="/assets/images/homepageicons/who-we-right.png" alt="" className={styles.bgImage} />
          <div className={styles.overlay}></div>
        </div>

        <div className={styles.heroInner}>

          {/* LEFT SLIDER */}
          <div className={styles.textCol}>
            <div
              className={styles.slideTrack}
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {finalSlides.map((s, i) => (
                <div
                  key={i}
                  className={styles.slide}
                  style={{ '--accent': s.accent } as React.CSSProperties}
                >
                  <span className={styles.eyebrow}>{s.eyebrow}</span>
                  <h1 className={styles.title}>{s.titleLine1}<span>{s.titleLine2}</span></h1>
                  <p className={styles.desc}>{s.desc}</p>
                  <div className={styles.tagRow}>
                    {s.tags?.map((t: string, idx: number) => (
                      <span key={idx} className={styles.pillTag}>{t}</span>
                    ))}
                  </div>
                  <div className={styles.ctaRow}>
                    {ctaUrl
                      ? <a href={ctaUrl} className={styles.btnPrimary}>{cta || 'Know More'}</a>
                      : <button className={styles.btnPrimary}>{cta || 'Know More'}</button>
                    }
                    {secondaryUrl && (
                      <a href={secondaryUrl} className={styles.btnLink}>
                        {secondaryText || 'See how it works'} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div 
              className={styles.sliderControls}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className={`${styles.timeline} ${isHovered ? styles.paused : ''}`}>
                {finalSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.timelineItem} ${i === index ? styles.active : ''}`}
                    onClick={() => handleGoTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  >
                    <div className={styles.timelineProgress}></div>
                  </button>
                ))}
              </div>
              <div className={styles.arrows}>
                <button className={styles.arrowBtn} onClick={handlePrev} aria-label="Previous">‹</button>
                <button className={styles.arrowBtn} onClick={handleNext} aria-label="Next">›</button>
              </div>
            </div>
          </div>

          {/* RIGHT ORBIT VISUAL */}
          <div className={styles.visualCol}>
            <div
              className={styles.orbitField}
              style={{ '--accent': currentSlide.accent } as React.CSSProperties}
            >
              <div className={styles.ring}></div>
              <div className={`${styles.ring} ${styles.ring2}`}></div>
              <div className={styles.glow}></div>

              {/* center image */}
              <div className={styles.laptopWrap}>
                <img
                  src={currentSlide.centerImage || "/assets/images/homepageicons/lockimage.png"}
                  alt="Center Security Shield"
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'contain',
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'opacity 0.22s ease'
                  }}
                />
              </div>

              {/* orbiting badges */}
              <div className={styles.orbitWrap}>
                {currentSlide.orbit?.map((o: any, i: number) => {
                  const factorX = ORBIT_FACTORS[i] ? ORBIT_FACTORS[i].x : 0;
                  const factorY = ORBIT_FACTORS[i] ? ORBIT_FACTORS[i].y : 0;
                  return (
                    <div key={i} className={styles.iconSlot} style={{ '--x': factorX, '--y': factorY } as React.CSSProperties}>
                      <div className={styles.iconUpright}>
                        <div className={styles.iconContent}>
                          <div
                            className={styles.badge}
                            style={{
                              background: currentSlide.accent || colors?.['--nh-badge-bg-default'] || BADGE_COLORS[index % BADGE_COLORS.length],
                              opacity: isTransitioning ? 0 : 1
                            }}
                          >
                            {o.image ? (
                              <img
                                src={o.image}
                                alt={o.label}
                                style={{ width: '50%', height: '50%', objectFit: 'contain', borderRadius: '50%' }}
                              />
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ opacity: isTransitioning ? 0 : 1 }}
                              >
                                {ICONS[o.icon] || ICONS['lock']}
                              </svg>
                            )}
                          </div>
                          <span
                            className={styles.orbitTag}
                            style={{ opacity: isTransitioning ? 0 : 1 }}
                          >
                            {o.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className={styles.marquee}>
        <div className={styles.marqueeGroup}>
          {marqueeItems && marqueeItems.length > 0 ? (
            <>
              {marqueeItems.map((item: any, idx: number) => (
                <React.Fragment key={`m1-${idx}`}>
                  <span>{item.text}</span> <span className={styles.marqueeDot}></span>
                </React.Fragment>
              ))}
              {marqueeItems.map((item: any, idx: number) => (
                <React.Fragment key={`m1-dup-${idx}`}>
                  <span>{item.text}</span> <span className={styles.marqueeDot}></span>
                </React.Fragment>
              ))}
            </>
          ) : (
            <>
              <span>ENTERPRISE CYBERSECURITY</span> <span className={styles.marqueeDot}></span>
              <span>DATA PROTECTION</span> <span className={styles.marqueeDot}></span>
              <span>24x7 SUPPORT</span> <span className={styles.marqueeDot}></span>
              <span>ZERO TRUST ARCHITECTURE</span> <span className={styles.marqueeDot}></span>
              <span>VAPT & COMPLIANCE</span> <span className={styles.marqueeDot}></span>
              <span>ENTERPRISE CYBERSECURITY</span> <span className={styles.marqueeDot}></span>
              <span>DATA PROTECTION</span> <span className={styles.marqueeDot}></span>
              <span>24x7 SUPPORT</span> <span className={styles.marqueeDot}></span>
              <span>ZERO TRUST ARCHITECTURE</span> <span className={styles.marqueeDot}></span>
              <span>VAPT & COMPLIANCE</span> <span className={styles.marqueeDot}></span>
            </>
          )}
        </div>
        <div className={styles.marqueeGroup} aria-hidden="true">
          {marqueeItems && marqueeItems.length > 0 ? (
            <>
              {marqueeItems.map((item: any, idx: number) => (
                <React.Fragment key={`m2-${idx}`}>
                  <span>{item.text}</span> <span className={styles.marqueeDot}></span>
                </React.Fragment>
              ))}
              {marqueeItems.map((item: any, idx: number) => (
                <React.Fragment key={`m2-dup-${idx}`}>
                  <span>{item.text}</span> <span className={styles.marqueeDot}></span>
                </React.Fragment>
              ))}
            </>
          ) : (
            <>
              <span>ENTERPRISE CYBERSECURITY</span> <span className={styles.marqueeDot}></span>
              <span>DATA PROTECTION</span> <span className={styles.marqueeDot}></span>
              <span>24x7 SUPPORT</span> <span className={styles.marqueeDot}></span>
              <span>ZERO TRUST ARCHITECTURE</span> <span className={styles.marqueeDot}></span>
              <span>VAPT & COMPLIANCE</span> <span className={styles.marqueeDot}></span>
              <span>ENTERPRISE CYBERSECURITY</span> <span className={styles.marqueeDot}></span>
              <span>DATA PROTECTION</span> <span className={styles.marqueeDot}></span>
              <span>24x7 SUPPORT</span> <span className={styles.marqueeDot}></span>
              <span>ZERO TRUST ARCHITECTURE</span> <span className={styles.marqueeDot}></span>
              <span>VAPT & COMPLIANCE</span> <span className={styles.marqueeDot}></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
