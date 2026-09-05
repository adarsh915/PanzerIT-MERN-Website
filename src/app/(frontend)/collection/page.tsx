import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import Image from "next/image";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CollectionPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="collection-hero-section">
        <Breadcrumb 
          title="Our Collection" 
          paths={[{ name: "Collection" }]} 
          image="/assets/images/hero/breadblog.png"
        />
        
        <div className="collection-hero-content space bg-light">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="collection-hero-text">
                  <span className="collection-badge">Premium Collection</span>
                  <h1 className="collection-title">Discover Our Exclusive Collection</h1>
                  <p className="collection-description">
                    Explore our carefully curated collection of premium solutions designed to meet your business needs. 
                    Each item is crafted with precision and backed by industry-leading expertise.
                  </p>
                  <div className="collection-hero-actions">
                    <Link href="#parameters" className="theme-btn br-30">
                      <span className="link-effect">
                        <span className="effect-1">Explore Now</span>
                        <span className="effect-1">Explore Now</span>
                      </span>
                    </Link>
                    <Link href="/contact" className="theme-btn br-30 btn-outline">
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="collection-hero-image">
                  <Image 
                    src="/assets/images/about/cyber.webp" 
                    alt="Collection showcase" 
                    width={600} 
                    height={500}
                    priority
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parameters Section */}
      <section id="parameters" className="collection-parameters-section space bg-light2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb-60">
                <span className="sub-title-2 two">Key Features</span>
                <h2 className="sec-title">Collection Parameters</h2>
                <p className="sec-text">
                  Essential parameters that define our collection standards
                </p>
              </div>
            </div>
          </div>
          <div className="row gy-30">
            <div className="col-lg-3 col-md-6">
              <div className="parameter-card">
                <div className="parameter-icon">
                  <i className="fa-light fa-gauge-high"></i>
                </div>
                <h4 className="parameter-title">Performance</h4>
                <p className="parameter-text">
                  High-performance solutions optimized for speed and efficiency
                </p>
                <div className="parameter-value">99.9%</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="parameter-card">
                <div className="parameter-icon">
                  <i className="fa-light fa-shield-check"></i>
                </div>
                <h4 className="parameter-title">Security</h4>
                <p className="parameter-text">
                  Enterprise-grade security with advanced threat protection
                </p>
                <div className="parameter-value">100%</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="parameter-card">
                <div className="parameter-icon">
                  <i className="fa-light fa-arrows-maximize"></i>
                </div>
                <h4 className="parameter-title">Scalability</h4>
                <p className="parameter-text">
                  Flexible solutions that grow with your business needs
                </p>
                <div className="parameter-value">∞</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="parameter-card">
                <div className="parameter-icon">
                  <i className="fa-light fa-headset"></i>
                </div>
                <h4 className="parameter-title">Support</h4>
                <p className="parameter-text">
                  24/7 dedicated support from our expert team
                </p>
                <div className="parameter-value">24/7</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Composition Section */}
      <section className="collection-composition-section space bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-40 mb-lg-0">
              <div className="composition-image-grid">
                <div className="composition-main-image">
                  <Image 
                    src="/assets/images/about/cc.webp" 
                    alt="Composition showcase" 
                    width={500} 
                    height={400}
                    style={{ width: "100%", height: "auto", borderRadius: "20px" }}
                  />
                </div>
                <div className="composition-stats">
                  <div className="stat-item">
                    <h3>11+</h3>
                    <span>Partner Brands</span>
                  </div>
                  <div className="stat-item">
                    <h3>360°</h3>
                    <span>Security Coverage</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="composition-content">
                <span className="sub-title-2 two">What We Offer</span>
                <h2 className="sec-title mb-30">Collection Composition</h2>
                <p className="mb-30">
                  Our collection is thoughtfully composed of industry-leading solutions, 
                  carefully selected and integrated to provide comprehensive protection 
                  and efficiency for your business.
                </p>
                <div className="composition-list">
                  <div className="composition-item">
                    <div className="composition-item-icon">
                      <i className="fa-light fa-check"></i>
                    </div>
                    <div className="composition-item-content">
                      <h5>Premium Quality</h5>
                      <p>Each component meets the highest quality standards</p>
                    </div>
                  </div>
                  <div className="composition-item">
                    <div className="composition-item-icon">
                      <i className="fa-light fa-check"></i>
                    </div>
                    <div className="composition-item-content">
                      <h5>Seamless Integration</h5>
                      <p>All solutions work together harmoniously</p>
                    </div>
                  </div>
                  <div className="composition-item">
                    <div className="composition-item-icon">
                      <i className="fa-light fa-check"></i>
                    </div>
                    <div className="composition-item-content">
                      <h5>Regular Updates</h5>
                      <p>Continuous improvements and new features</p>
                    </div>
                  </div>
                  <div className="composition-item">
                    <div className="composition-item-icon">
                      <i className="fa-light fa-check"></i>
                    </div>
                    <div className="composition-item-content">
                      <h5>Expert Support</h5>
                      <p>Professional guidance at every step</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tones Section */}
      <section className="collection-tones-section space bg-light2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb-60">
                <span className="sub-title-2 two">Our Approach</span>
                <h2 className="sec-title">Collection Tones</h2>
                <p className="sec-text">
                  The distinctive characteristics that set our collection apart
                </p>
              </div>
            </div>
          </div>
          <div className="row gy-40">
            <div className="col-lg-4 col-md-6">
              <div className="tone-card">
                <div className="tone-number">01</div>
                <div className="tone-icon">
                  <i className="fa-light fa-lightbulb"></i>
                </div>
                <h4 className="tone-title">Innovation</h4>
                <p className="tone-text">
                  Cutting-edge technology and forward-thinking solutions that keep you ahead of the curve.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="tone-card">
                <div className="tone-number">02</div>
                <div className="tone-icon">
                  <i className="fa-light fa-gem"></i>
                </div>
                <h4 className="tone-title">Excellence</h4>
                <p className="tone-text">
                  Uncompromising commitment to quality and perfection in every aspect of our collection.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="tone-card">
                <div className="tone-number">03</div>
                <div className="tone-icon">
                  <i className="fa-light fa-handshake"></i>
                </div>
                <h4 className="tone-title">Reliability</h4>
                <p className="tone-text">
                  Dependable solutions you can trust, backed by proven track records and expertise.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="tone-card">
                <div className="tone-number">04</div>
                <div className="tone-icon">
                  <i className="fa-light fa-rocket"></i>
                </div>
                <h4 className="tone-title">Efficiency</h4>
                <p className="tone-text">
                  Streamlined processes and optimized workflows that maximize productivity and results.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="tone-card">
                <div className="tone-number">05</div>
                <div className="tone-icon">
                  <i className="fa-light fa-users"></i>
                </div>
                <h4 className="tone-title">Collaboration</h4>
                <p className="tone-text">
                  Built for teamwork with integrated tools that enhance communication and cooperation.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="tone-card">
                <div className="tone-number">06</div>
                <div className="tone-icon">
                  <i className="fa-light fa-shield-heart"></i>
                </div>
                <h4 className="tone-title">Trust</h4>
                <p className="tone-text">
                  Transparent practices and ethical standards that build lasting relationships with clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Place Section */}
      <section className="collection-place-section space bg-dark">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-40 mb-lg-0">
              <div className="place-content">
                <span className="sub-title-2 two text-white">Global Presence</span>
                <h2 className="sec-title text-white mb-30">Where Our Collection Stands</h2>
                <p className="text-white mb-40">
                  Our collection is trusted by businesses across the globe, serving multiple 
                  industries and regions with excellence and dedication. With a strong presence 
                  in key markets, we're always close to our clients.
                </p>
                <div className="place-locations">
                  <div className="location-item">
                    <div className="location-icon">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="location-content">
                      <h5 className="text-white">Delhi (NCR)</h5>
                      <p className="text-white-50">Primary Operations Hub</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <div className="location-icon">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="location-content">
                      <h5 className="text-white">Mumbai</h5>
                      <p className="text-white-50">Regional Office</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <div className="location-icon">
                      <i className="fa-solid fa-network-wired"></i>
                    </div>
                    <div className="location-content">
                      <h5 className="text-white">All India Network</h5>
                      <p className="text-white-50">Nationwide Coverage</p>
                    </div>
                  </div>
                </div>
                <div className="place-cta mt-40">
                  <Link href="/contact" className="theme-btn br-30">
                    <span className="link-effect">
                      <span className="effect-1">Get In Touch</span>
                      <span className="effect-1">Get In Touch</span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="place-map">
                <Image 
                  src="/assets/images/about/header-img.jpeg" 
                  alt="Global presence map" 
                  width={600} 
                  height={400}
                  style={{ 
                    width: "100%", 
                    height: "auto", 
                    borderRadius: "20px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)"
                  }}
                />
                <div className="place-stats-overlay">
                  <div className="stat-badge">
                    <i className="fa-light fa-globe"></i>
                    <div>
                      <strong>Pan India</strong>
                      <span>Service Coverage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="collection-cta-section space bg-light">
        <div className="container">
          <div className="collection-cta-box">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="cta-title">Ready to Explore Our Collection?</h2>
                <p className="cta-text">
                  Get started with our premium solutions and experience the difference.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link href="/solution" className="theme-btn br-30 btn-large">
                  <span className="link-effect">
                    <span className="effect-1">View All Solutions</span>
                    <span className="effect-1">View All Solutions</span>
                  </span>
                  <i className="fa-solid fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
