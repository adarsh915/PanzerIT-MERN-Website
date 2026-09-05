import { Metadata } from "next";
import Link from "next/link";
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { createPageMetadata } from '@/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('seo_privacy_policy');
  return createPageMetadata(seo, '/privacy-policy');
}

const policySections = [
  {
    title: "1. Personal Information",
    paragraphs: [
      "In some circumstances, Panzer IT may request personal information from you, such as your name, email address or other contact details. Your response to these enquiries is voluntary.",
      "Panzer IT uses this information for business purposes, including responding to enquiries, order processing, and informing you about product releases, updates or events that may assist your business.",
      "We may disclose personal information when required by law, court order or other legal process. We may also disclose information in good faith when it is reasonably necessary to enforce our terms or privacy policy, respond to third-party rights claims, or protect the rights, property or safety of our users or the public.",
    ],
  },
  {
    title: "2. Domain Information and Statistics",
    paragraphs: [
      "Panzer IT may automatically collect information about visitors and site activity. This information is stored on an aggregate basis and is used to improve our web-based and business offerings.",
    ],
  },
  {
    title: "3. Cookies and Other Tracking Technologies",
    paragraphs: [
      "Some pages may use cookies or other tracking technologies. These technologies may record information such as internet domain, host names and IP addresses.",
      "Information recorded through cookies or tracking technologies is used to improve our website and for administrative purposes only.",
    ],
  },
  {
    title: "4. Disclosure to Third Parties",
    paragraphs: [
      "We may disclose personal information to third parties when it is required to provide access to our services, comply with legal obligations, enforce user agreements, support marketing or advertising activities, or prevent, detect, mitigate and investigate fraudulent or illegal activity related to our services.",
      "We do not disclose your personal information to third parties for their own marketing or advertising purposes without your explicit consent.",
    ],
  },
  {
    title: "5. Contacting You",
    paragraphs: [
      "From time to time, we may send email messages about new products, updates to existing products or other information that may be valuable for your business.",
      "You may choose not to receive promotional emails and unsubscribe from our mailing list. The unsubscribe process may not be immediate, and we may still contact you for administrative purposes even after you unsubscribe from promotional messages.",
    ],
  },
  {
    title: "6. Consent",
    paragraphs: [
      "We may share personal information with our corporate entities and affiliates. These entities may market to you as a result of such sharing unless you explicitly opt out.",
      "If Panzer IT, its assets or its business are merged, acquired, reorganized, amalgamated or restructured, some or all personal information may be shared or transferred to the relevant business entity. The receiving entity will be required to follow this privacy policy with respect to your personal information.",
    ],
  },
];

export default function Page() {
  return (
    <>
      <Breadcrumb title="Privacy Policy" paths={[{ name: "Privacy Policy" }]} />

      <section className="panzer-privacy-section space bg-light">
        <div className="container">
          <div className="panzer-privacy-layout">
            <aside className="panzer-privacy-summary wow fadeInUp" data-wow-delay=".1s">
              <span className="panzer-privacy-summary-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </span>
              <h2>Privacy at Panzer IT</h2>
              <p>
                We view protection of your privacy as an important principle and take care to safeguard your personal information with reasonable security measures.
              </p>
              <Link href="mailto:explore@PanzerIT.com" className="panzer-privacy-mail">
                <i className="fa-regular fa-envelope"></i>
                explore@PanzerIT.com
              </Link>
            </aside>

            <div className="panzer-privacy-content wow fadeInUp" data-wow-delay=".2s">
              <div className="panzer-privacy-intro">
                <h2>Privacy Policy</h2>
                <p>
                  We understand that you and your personal information are important assets. We store and process information, including sensitive financial information if any, in accordance with the Information Technology Act, 2000 and applicable rules.
                </p>
                <p>
                  We take utmost care to safeguard your data. If you object to your information being transferred or used as described in this policy, please do not use this website.
                </p>
              </div>

              {policySections.map((section) => (
                <article className="panzer-privacy-block" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </article>
              ))}

              <div className="panzer-privacy-note">
                <p>
                  Panzer IT reserves the right to change, modify or update this statement at any time without notice. For questions regarding this privacy statement, infringement, piracy, copyrights or IPR matters, please write to{" "}
                  <Link href="mailto:explore@PanzerIT.com">explore@PanzerIT.com</Link>.
                </p>
                <Link href="/contact" className="theme-btn br-30 panzer-privacy-contact">
                  <span className="link-effect">
                    <span className="effect-1">Contact Us</span>
                    <span className="effect-1">Contact Us</span>
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
      </section>
    </>
  );
}
