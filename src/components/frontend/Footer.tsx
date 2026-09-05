import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import styles from './footer.module.css'
import NewsletterForm from './NewsletterForm'

// ── Types ─────────────────────────────────────────────────────────────────────

export type FooterLink = {
  id: string
  label: string
  url: string
  order: number
}

export type FooterColumn = {
  id: string
  title: string
  order: number
  links: FooterLink[]
}

export type FooterSocialLink = {
  id: string
  label: string
  icon: string   // fontawesome class suffix, e.g. 'linkedin-in'
  url: string
}

export type FooterContactData = {
  logo?: string
  brandName?: string
  tagline?: string
  description?: string
  copyrightText?: string
  email?: string
  phone?: string
  location?: string
  socialLinks?: FooterSocialLink[]
}

type Props = {
  columns: FooterColumn[]
  contact?: FooterContactData
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function NavLink({ url, label }: { url: string; label: string }) {
  const isInternal = url.startsWith('/')
  if (isInternal) {
    return <Link href={url} className={styles.navLink}>{label}</Link>
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.navLink}>
      {label}
    </a>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Footer({ columns, contact = {} }: Props) {
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  const {
    logo,
    brandName = 'Panzer IT',
    tagline = 'MAKE IT SECURE',
    description = 'Panzer IT helps organizations protect data across endpoints, servers, cloud, storage and networks with advanced security, backup and recovery solutions.',
    copyrightText = 'Copyright © Panzer IT — Make IT Secure. All Rights Reserved.',
    email = 'Sales@PanzerIT.com',
    phone = '+91 90046 55099',
    location = 'Delhi (NCR) | Mumbai | All India Network',
    socialLinks = [],
  } = contact

  return (
    <section className={styles.footerSection}>

      {/* ── TOP ROW ── */}
      <div className={styles.topRow}>

        {/* Brand block */}
        <div className={styles.brandBlock}>
          <div className={styles.logoWrap}>
            {logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logo} alt={`${brandName} Logo`} className={styles.logoImg} />
            ) : (
              <Image
                src="/assets/images/logo/logo.png"
                alt={`${brandName} Logo`}
                width={160}
                height={50}
                style={{ width: 'auto', height: 'auto' }}
              />
            )}
          </div>
          {tagline && <p className={styles.tagline}>{tagline}</p>}
          {description && <p className={styles.brandDesc}>{description}</p>}
        </div>

        {/* Dynamic link columns */}
        <div className={styles.dynamicLinksWrap}>
          {sortedColumns.map((col) => {
            const sortedLinks = [...col.links].sort((a, b) => a.order - b.order)
            return (
              <div key={col.id} className={styles.linkColumn}>
                <h3 className={styles.colHeading}>{col.title}</h3>
                <ul className={styles.linkList}>
                  {sortedLinks.map((link) => (
                    <li key={link.id}>
                      <NavLink url={link.url} label={link.label} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Newsletter block (dynamic) */}
        <div className={styles.newsletterBlock}>
          <h3 className={styles.colHeading}>SUBSCRIBE TO OUR NEWSLETTERS</h3>
          <p className={styles.newsletterDesc}>
            Stay informed on the latest cybersecurity trends, solutions and updates.
          </p>
          <NewsletterForm
            className={styles.newsletterForm}
            inputClassName={styles.emailInput}
            buttonClassName={styles.sendBtn}
          />
        </div>
      </div>

      {/* ── MIDDLE ROW — contact bar ── */}
      <div className={styles.contactBar}>
        <div className={styles.contactItems}>

          {email && (
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <i className="fa-light fa-envelope" />
              </span>
              <div>
                <span className={styles.contactLabel}>EMAIL</span>
                <a href={`mailto:${email}`} className={styles.contactValue}>{email}</a>
              </div>
            </div>
          )}

          {phone && (
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <i className="fa-light fa-phone" />
              </span>
              <div>
                <span className={styles.contactLabel}>CALL US</span>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className={styles.contactValue}>{phone}</a>
              </div>
            </div>
          )}

          {location && (
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <i className="fa-light fa-location-dot" />
              </span>
              <div>
                <span className={styles.contactLabel}>LOCATION</span>
                <span className={styles.contactValue}>{location}</span>
              </div>
            </div>
          )}

        </div>

        {socialLinks.length > 0 && (
          <div className={styles.socialIcons}>
            {socialLinks.map((s) => {
              return (
                <a
                  key={s.id}
                  href={s.url || '#'}
                  aria-label={`${brandName} on ${s.label}`}
                  className={styles.socialBtn}
                  target={s.url?.startsWith('http') ? '_blank' : undefined}
                  rel={s.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <i className={`${s.icon === 'link' || !s.icon ? 'fa-light' : 'fab'} fa-${s.icon || 'link'}`} />
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* ── BOTTOM ROW — copyright bar ── */}
      <div className={styles.bottomBar}>
        <p className={styles.copyright} suppressHydrationWarning>
          Copyright &copy; {new Date().getFullYear()} Panzer IT &mdash; Make IT Secure. All Rights Reserved.
        </p>

        <div className={styles.bottomRight}>
          <Link href="/privacy-policy" className={styles.privacyLink}>
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* ── Chatbot Script ── */}
      <Script 
        id="chatbot-script" 
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,o,f,js,fjs){
              w['AiAgent'] = o; w[o]=w[o]||function(){(w[o].q = w[o].q || []).push(arguments)};
              js=d.createElement(s); fjs=d.getElementsByTagName(s)[0];
              js.id=o; js.src=f; js.async=1; fjs.parentNode.insertBefore(js,fjs);
            }(window,document,'script','wai','https://tagname.in/widget.js'));
            wai('init', 'ANasRPKRvpOWhwQSe7Pv7SsYB6VjSo9GIcp4uoMarpHF4e3W53ZkQUlJV3ZVNteE');
          `
        }}
      />
    </section>
  )
}
