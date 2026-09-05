"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";

const defaultSolutionLinks = [
  { label: "Scopd DLP with UEBA", icon: "fa-shield-check", href: "/solution" },
  { label: "Vulnerability Scanner, Assessment & Penetration Testing", icon: "fa-magnifying-glass-chart", href: "/solution" },
  { label: "Employee Monitoring Solution", icon: "fa-desktop", href: "/solution" },
  { label: "Most Advance Anti-Malware", icon: "fa-bug-slash", href: "/solution" },
  { label: "Backup & Disaster Recovery", icon: "fa-cloud-arrow-up", href: "/solution" },
  { label: "Backup Solution", icon: "fa-database", href: "/solution" },
  { label: "Data Leak Prevention - DLP", icon: "fa-file-shield", href: "/solution" },
  { label: "Advance Threat Prevention | EDR | EPS", icon: "fa-radar", href: "/solution" },
];

const defaultBrandLinks = [
  { label: "Netand IAM PAM", href: "/brand#netand" },
  { label: "Mirobase Employee Monitoring", href: "/brand#mirobase" },
  { label: "FalconGaze SecureTower - UBA", href: "/brand#falcongaze" },
  { label: "Somansa Endpoint Data Loss Prevention", href: "/brand#somansa" },
  { label: "SecPoint Penetrator Vulnerability Scanner & Assessment", href: "/brand#secpoint" },
  { label: "Netop - Secure Remote Access", href: "/brand#netop" },
  { label: "Emsisoft - Advance Malware Protection", href: "/brand#emsisoft" },
  { label: "Vembu BDR Suite", href: "/brand#vembu" },
  { label: "Acronis Backup Solution", href: "/brand#acronis" },
];

function ExpandToggle({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <span
      className="mean-expand-class"
      aria-expanded={isOpen}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
    />
  );
}

function MainNavigation({
  className = "navigation",
  mobile = false,
  openSubmenu,
  onToggleSubmenu,
  onNavigate,
  headerData,
}: {
  className?: string;
  mobile?: boolean;
  openSubmenu?: string | null;
  onToggleSubmenu?: (menu: string) => void;
  onNavigate?: () => void;
  headerData?: any;
}) {
  const solutionsOpen = openSubmenu === "solutions";
  const brandsOpen = openSubmenu === "brands";
  const companyOpen = openSubmenu === "company";

  const activeSolutions = headerData?.solutions || defaultSolutionLinks;
  const activeBrands = headerData?.brands || defaultBrandLinks;

  return (
    <ul className={className}>
      <li className="active">
        <Link className="active" href="/" onClick={onNavigate}>Home</Link>
      </li>
      <li className={`menu-item-has-children${mobile ? " submenu-item-has-children" : ""}${solutionsOpen ? " active-class" : ""}`}>
        <Link href="/solution" onClick={onNavigate}>
          Solutions
          {mobile && <ExpandToggle isOpen={solutionsOpen} onToggle={() => onToggleSubmenu?.("solutions")} />}
        </Link>
        <ul
          className={`sub-menu solution-sub-menu${mobile ? " submenu-class" : ""}${solutionsOpen ? " menu-open" : ""}`}
          style={mobile ? { display: solutionsOpen ? "block" : "none" } : undefined}
        >
          {activeSolutions.map((item: any) => (
            <li key={item.label}>
              <Link href={item.href || "/solution"} onClick={onNavigate}>
                {item.logo ? (
                  <Image
                    src={item.logo}
                    alt={item.logoAlt || item.label}
                    width={28}
                    height={28}
                    className="panzer-dropdown-icon"
                    style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                  />
                ) : (
                  <i className={`fa-solid ${item.icon || "fa-shield-check"} panzer-dropdown-icon`}></i>
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </li>
      <li className={`menu-item-has-children${mobile ? " submenu-item-has-children" : ""}${brandsOpen ? " active-class" : ""}`}>
        <Link href="/brand" onClick={onNavigate}>
          Brands
          {mobile && <ExpandToggle isOpen={brandsOpen} onToggle={() => onToggleSubmenu?.("brands")} />}
        </Link>
        <ul
          className={`sub-menu brand-sub-menu${mobile ? " submenu-class" : ""}${brandsOpen ? " menu-open" : ""}`}
          style={mobile ? { display: brandsOpen ? "block" : "none" } : undefined}
        >
          {activeBrands.map((item: any) => (
            <li key={item.id || item.label}>
              <Link href={item.href || "/brand"} onClick={onNavigate}>
                {item.logo ? (
                  <Image
                    src={item.logo}
                    alt={item.label}
                    width={28}
                    height={28}
                    className="panzer-dropdown-icon"
                    style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                  />
                ) : (
                  <i className="fa-solid fa-shield-check panzer-dropdown-icon"></i>
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </li>
      <li>
        <Link href="/blog" onClick={onNavigate}>Blogs</Link>
      </li>
      <li>
        <Link href="/resources" onClick={onNavigate}>Resources</Link>
      </li>
      <li className={`menu-item-has-children${mobile ? " submenu-item-has-children" : ""}${companyOpen ? " active-class" : ""}`}>
        <Link href="/about" onClick={onNavigate}>
          Company
          {mobile && <ExpandToggle isOpen={companyOpen} onToggle={() => onToggleSubmenu?.("company")} />}
        </Link>
        <ul
          className={`sub-menu${mobile ? " submenu-class" : ""}${companyOpen ? " menu-open" : ""}`}
          style={mobile ? { display: companyOpen ? "block" : "none" } : undefined}
        >
          <li><Link href="/about" onClick={onNavigate}>About Us</Link></li>

        </ul>
      </li>
      {mobile && (
        <li>
          <Link href="/contact" onClick={onNavigate}>Contact Us</Link>
        </li>
      )}
    </ul>
  );
}

function SocialLinks({ className }: { className: string }) {
  return (
    <ul className={className}>
      <li><Link href="/contact" aria-label="Contact Panzer IT on X"><i className="fab fa-twitter"></i></Link></li>
      <li><Link href="/contact" aria-label="Contact Panzer IT on Facebook"><i className="fab fa-facebook-f"></i></Link></li>
      <li><Link href="/contact" aria-label="Contact Panzer IT on Pinterest"><i className="fab fa-pinterest"></i></Link></li>
      <li><Link href="/contact" aria-label="Contact Panzer IT on Instagram"><i className="fab fa-instagram"></i></Link></li>
    </ul>
  );
}

export function SiteHeader({ headerData }: { headerData?: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isStickySearchExpanded, setIsStickySearchExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const stickySearchInputRef = useRef<HTMLInputElement>(null);

  const logoData = headerData?.logoData;
  const logoSrc = logoData?.logoUrl || "/assets/images/logo/logo.png";
  const logoAlt = logoData?.logoAlt || "Panzer IT Logo";
  const logoWidth = logoData?.logoWidth || 160;

  useEffect(() => {
    const updateStickyHeader = () => {
      setIsSticky(window.scrollY > 100);
    };

    updateStickyHeader();
    window.addEventListener("scroll", updateStickyHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateStickyHeader);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("open-sidebar", isSidebarOpen);

    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    if (isStickySearchExpanded && stickySearchInputRef.current) {
      stickySearchInputRef.current.focus();
    }

    return () => {
      document.body.classList.remove("open-sidebar");
    };
  }, [isSearchExpanded, isStickySearchExpanded, isSidebarOpen]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;

      if (target?.closest(".sidebar-trigger")) {
        event.preventDefault();
        setIsSidebarOpen((isOpen) => !isOpen);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((isOpen) => {
      if (isOpen) {
        setOpenMobileSubmenu(null);
      }

      return !isOpen;
    });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSubmenu(null);
  };

  const toggleMobileSubmenu = (menu: string) => {
    setOpenMobileSubmenu((current) => (current === menu ? null : menu));
  };

  return (
    <>
      <header className="tv-header header-style3 panzer-image-header">
        <div className="container">
          <div className="main-wrapper">
            <div className="menu-area">
              <div className="row align-items-center justify-content-between">
                <div className="col-auto logo">
                  <div className="header-logo">
                    <Link href="/">
                      {logoData?.logoUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={logoAlt} src={logoSrc} width={logoWidth} loading="eager" style={{ height: "auto" }} />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={logoAlt} src={logoSrc} width={logoWidth} loading="eager" style={{ height: "auto" }} />
                        </>
                      ) : (
                        <>
                          <Image alt="logo" src="/assets/images/logo/logo.png" width={160} height={50} loading="eager" style={{ width: "auto", height: "auto" }} />
                          <Image alt="logo" src="/assets/images/logo/logo.png" width={160} height={50} loading="eager" style={{ width: "auto", height: "auto" }} />
                        </>
                      )}
                    </Link>
                  </div>
                </div>
                <div className="col-auto nav-outer ms-auto">
                  <div className="nav-menu">
                    <nav className="main-menu d-none d-xl-inline-block">
                      <MainNavigation headerData={headerData} />
                    </nav>
                    <div className="navbar-right d-inline-flex d-xl-none">
                      <button className="menu-toggle sidebar-btn" type="button" aria-label="Open menu" onClick={toggleMobileMenu}>
                        <span className="line"></span>
                        <span className="line"></span>
                        <span className="line"></span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-auto header-right-wrapper">
                  <div className="outer-box d-flex align-items-center gap-3">
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="search-btn" 
                        type="button" 
                        aria-label={isSearchExpanded ? "Close search" : "Search"}
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'inherit', 
                          fontSize: '18px', 
                          padding: '0 10px', 
                          cursor: 'pointer',
                          width: '38px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '30px',
                        }}
                      >
                        <i className={`fa-solid ${isSearchExpanded ? 'fa-times' : 'fa-magnifying-glass'}`} style={{ pointerEvents: 'none' }}></i>
                      </button>
                      
                      {/* Small Dropdown Search Box */}
                      {isSearchExpanded && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 10px)',
                            right: 0,
                            width: '400px',
                            background: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            zIndex: 9999,
                            animation: 'fadeInDown 0.3s ease-out',
                            padding: '20px'
                          }}
                        >
                          <style>{`
                            @keyframes fadeInDown {
                              from {
                                opacity: 0;
                                transform: translateY(-10px);
                              }
                              to {
                                opacity: 1;
                                transform: translateY(0);
                              }
                            }
                          `}</style>
                          <form method="get" action="/search">
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              borderBottom: '3px solid var(--theme-color)',
                              position: 'relative'
                            }}>
                              <input
                                ref={searchInputRef}
                                type="text"
                                name="q"
                                placeholder="What are you searching for?"
                                autoComplete="off"
                                style={{
                                  flex: 1,
                                  padding: '8px 5px',
                                  border: 'none',
                                  background: 'transparent',
                                  outline: 'none',
                                  fontSize: '15px',
                                  color: '#333',
                                  fontFamily: 'inherit'
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    setIsSearchExpanded(false);
                                  }
                                }}
                              />
                              <button 
                                type="submit" 
                                aria-label="Search" 
                                style={{ 
                                  background: 'none',
                                  border: 'none', 
                                  color: 'var(--theme-color)', 
                                  cursor: 'pointer', 
                                  fontSize: '20px', 
                                  padding: '5px 10px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <i className="fa-solid fa-magnifying-glass" style={{ pointerEvents: 'none' }}></i>
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                    <Link href="/contact" className="panzer-header-cta">Get in touch</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`mobile-menu-wrapper${isMobileMenuOpen ? " body-visible" : ""}`} onClick={closeMobileMenu}>
        <div className="mobile-menu-area" onClick={(event) => event.stopPropagation()}>
          <button className="menu-toggle" type="button" aria-label="Close menu" onClick={toggleMobileMenu}><i className="fas fa-times"></i></button>
          <div className="mobile-logo">
            <Link href="/" onClick={closeMobileMenu}>
              {logoData?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={logoAlt} src={logoSrc} width={logoWidth} style={{ height: "auto" }} />
              ) : (
                <Image width={864} height={200} alt="Panzer IT" src="/assets/images/logo/logo.png" style={{ width: "auto", height: "auto" }} />
              )}
            </Link>
          </div>
          <div className="mobile-search" style={{ padding: "0 20px 1px 20px" }}>
            <form method="get" action="/search" style={{ position: "relative" }} onSubmit={closeMobileMenu}>
              <input
                type="text"
                name="q"
                placeholder="Search..."
                autoComplete="off"
                style={{
                  width: "100%",
                  padding: "12px 64px 12px 15px",
                  borderRadius: "25px",
                  border: "2px solid #e0e0e0",
                  outline: "none",
                  marginTop: "10px",
                  background: "var(--white-color)",
                  fontSize: "14px",
                  color: "#333333",
                  transition: "border-color 0.3s ease",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--theme-color)"
                  e.target.style.color = "#333333"
                }}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  position: "absolute",
                  right: "25px",
                  top: "60%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--theme-color)",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <i className="fa fa-search"></i>
              </button>
            </form>
          </div>
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <MainNavigation
              className="navigation clearfix"
              mobile
              openSubmenu={openMobileSubmenu}
              onToggleSubmenu={toggleMobileSubmenu}
              onNavigate={closeMobileMenu}
              headerData={headerData}
            />
          </nav>
          <ul className="contact-list-one">
            <li>
              <div className="contact-info-box">
                <span className="icon fa-solid fa-phone"></span>
                <span className="title">Call Panzer IT</span>
                <Link href="tel:+919004655099">+91 90046 55099</Link>
              </div>
            </li>
            <li>
              <div className="contact-info-box">
                <span className="icon fa-light fa-envelope"></span>
                <span className="title">Email Us</span>
                <Link href="mailto:Sales@PanzerIT.com">Sales@PanzerIT.com</Link>
              </div>
            </li>
            <li>
              <div className="contact-info-box">
                <span className="icon fa-light fa-alarm-clock"></span>
                <span className="title">Availability</span>
                Working 24x7 | World Wide Work
              </div>
            </li>
          </ul>
          <SocialLinks className="social-links" />
        </div>
      </div>

      <div className={`sticky-header${isSticky ? " fixed-header" : ""}`}>
        <div className="container">
          <div className="main-wrapper">
            <div className="menu-area">
              <div className="row align-items-center justify-content-between">
                <div className="col-auto logo">
                  <div className="header-logo">
                    <Link href="/">
                      {logoData?.logoUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={logoAlt} src={logoSrc} width={logoWidth} loading="eager" style={{ height: "auto" }} />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={logoAlt} src={logoSrc} width={logoWidth} loading="eager" style={{ height: "auto" }} />
                        </>
                      ) : (
                        <>
                          <Image alt="logo" src="/assets/images/logo/logo.png" width={160} height={50} loading="eager" style={{ width: "auto", height: "auto" }} />
                          <Image alt="logo" src="/assets/images/logo/logo.png" width={160} height={50} loading="eager" style={{ width: "auto", height: "auto" }} />
                        </>
                      )}
                    </Link>
                  </div>
                </div>
                <div className="col-auto nav-outer ms-auto">
                  <div className="nav-menu">
                    <nav className="main-menu d-none d-xl-inline-block">
                      <MainNavigation headerData={headerData} />
                    </nav>
                    <div className="navbar-right d-inline-flex d-xl-none">
                      <button className="menu-toggle sidebar-btn" type="button" aria-label="Open menu" onClick={toggleMobileMenu}>
                        <span className="line"></span>
                        <span className="line"></span>
                        <span className="line"></span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-auto header-right-wrapper">
                  <div className="outer-box d-flex align-items-center gap-3">
                    <div style={{ position: 'relative' }}>
                      <button 
                        type="button" 
                        aria-label={isStickySearchExpanded ? "Close search" : "Search"}
                        onClick={() => setIsStickySearchExpanded(!isStickySearchExpanded)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'inherit', 
                          fontSize: '18px', 
                          padding: '0 10px', 
                          cursor: 'pointer',
                          width: '38px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '30px',
                        }}
                      >
                        <i className={`fa-solid ${isStickySearchExpanded ? 'fa-times' : 'fa-magnifying-glass'}`} style={{ pointerEvents: 'none' }}></i>
                      </button>
                      
                      {/* Small Dropdown Search Box for Sticky Header */}
                      {isStickySearchExpanded && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 10px)',
                            right: 0,
                            width: '400px',
                            background: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            zIndex: 9999,
                            animation: 'fadeInDown 0.3s ease-out',
                            padding: '20px'
                          }}
                        >
                          <form method="get" action="/search">
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              borderBottom: '3px solid var(--theme-color)',
                              paddingBottom: '10px',
                              position: 'relative'
                            }}>
                              <input
                                ref={stickySearchInputRef}
                                type="text"
                                name="q"
                                placeholder="What are you searching for?"
                                autoComplete="off"
                                style={{
                                  flex: 1,
                                  padding: '8px 5px',
                                  border: 'none',
                                  background: 'transparent',
                                  outline: 'none',
                                  fontSize: '15px',
                                  color: '#333',
                                  fontFamily: 'inherit'
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    setIsStickySearchExpanded(false);
                                  }
                                }}
                              />
                              <button 
                                type="submit" 
                                aria-label="Search" 
                                style={{ 
                                  background: 'none',
                                  border: 'none', 
                                  color: 'var(--theme-color)', 
                                  cursor: 'pointer', 
                                  fontSize: '20px', 
                                  padding: '5px 10px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <i className="fa-solid fa-magnifying-glass" style={{ pointerEvents: 'none' }}></i>
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                    <Link href="/contact" className="panzer-header-cta">Get in touch</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="sidebar-area" className="sidebar">
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        <div className="sidebar-wrapper">
          <button className="sidebar-close-btn" type="button" aria-label="Close sidebar" onClick={() => setIsSidebarOpen(false)}>
            <svg className="icon-close" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="12.7px" viewBox="0 0 16 12.7" xmlSpace="preserve">
              <g>
                <rect x="0" y="5.4" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -2.1569 7.5208)" width="16" height="2"></rect>
                <rect x="0" y="5.4" transform="matrix(0.7071 0.7071 -0.7071 0.7071 6.8431 -3.7929)" width="16" height="2"></rect>
              </g>
            </svg>
          </button>
          <div className="sidebar-content">
            <div className="sidebar-logo">
              <Link className="dark-logo" href="/">
                {logoData?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={logoAlt} src={logoSrc} width={logoWidth} style={{ height: "auto" }} />
                ) : (
                  <Image width={200} height={46} src="/assets/images/logo/logo.png" alt="logo" />
                )}
              </Link>
            </div>
            <div className="sidebar-menu-wrap"></div>
            <div className="sidebar-about">
              <h6>Make IT Secure</h6>
              <div className="sidebar-header">
                <h3>Continuous Secure Data Accessibility &amp; Availability</h3>
              </div>
            </div>
            <div className="instafeed-wrapper">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="insta-item">
                  <Link href="/contact">
                    <Image
                      src={`/assets/images/sidebar/sidebar${n === 1 ? "1.jpeg" : `-${n}.jpg`}`}
                      alt=""
                      width={180}
                      height={180}
                      sizes="180px"
                    />
                    <span className="overlay"><i className="fa-brands fa-instagram"></i></span>
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center mt-40">Get latest updates on Panzer IT security solutions and product news</p>
            <NewsletterForm
              className="newsletter-form"
              inputClassName="email"
            />
            <SocialLinks className="sidebar-social" />
          </div>
        </div>
      </div>
    </>
  );
}
