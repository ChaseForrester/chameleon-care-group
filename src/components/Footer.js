"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";
import { SITE } from "@/lib/seedData";
import { REGIONS } from "@/lib/locations";
import { NOTIFY_EMAILS } from "@/lib/emails";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <div className={styles.brandRow}>
            <Image
              src="/images/logo-mark.png"
              alt="Chameleon Care Group"
              width={52}
              height={52}
              className={styles.logo}
            />
            <div>
              <strong>Chameleon Care Group</strong>
              <span>Blending In. Standing Out.</span>
            </div>
          </div>
          <p>
            Personalised NDIS, aged care and private nursing across the
            Sutherland Shire, Illawarra, Central Coast and Greater Sydney.
          </p>
          <div className={styles.socials}>
            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
          <Image
            src="/images/ndis.png"
            alt="NDIS provider"
            width={64}
            height={64}
            className={styles.ndis}
          />
        </div>

        <div className={styles.col}>
          <h4>Explore</h4>
          <Link href="/">Home</Link>
          <Link href="/about-us">About us</Link>
          <Link href="/services">Services</Link>
          <Link href="/locations">Service areas</Link>
          <Link href="/success-stories">Success stories</Link>
          <Link href="/blog">Blog</Link>
        </div>

        <div className={styles.col}>
          <h4>Get started</h4>
          <Link href="/book-with-us">Book with us</Link>
          <Link href="/referral">Referral</Link>
          <Link href="/contact-us">Contact us</Link>
          <Link href="/offers">Offers</Link>
          <Link href="/laws">Laws & PDFs</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms & Conditions</Link>
        </div>

        <div className={styles.col}>
          <h4>Contact</h4>
          {NOTIFY_EMAILS.map((email) => (
            <a key={email} href={`mailto:${email}`}>
              {email}
            </a>
          ))}
          <a href={SITE.phoneHref}>{SITE.phone}</a>
          {REGIONS.map((r) => (
            <Link key={r.id} href={`/locations/${r.id}`}>
              {r.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Tech Aid powered badge — matches Illawarra Landscaping footer */}
      <div className={styles.powered}>
        <div className="container">
          <a
            className={styles.techAidBadge}
            href="https://www.techaidaustralia.com.au/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Powered by Tech Aid Australia"
          >
            <Image
              src="/images/tech-aid-logo.png"
              alt="Tech Aid Australia logo"
              width={48}
              height={48}
              className={styles.techAidMark}
            />
            <span className={styles.techAidText}>
              <span className={styles.techAidKicker}>Powered by</span>
              <span className={styles.techAidName}>Tech Aid Australia</span>
            </span>
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.ack}>{SITE.acknowledgement}</p>
          <div className={styles.copy}>
            <p>
              © {new Date().getFullYear()} Chameleon Care Group. All rights
              reserved.{" "}
              <Link href="/privacy">Privacy</Link>
              {" · "}
              <Link href="/terms">Terms</Link>
              {" · "}
              <Link href="/laws">Laws</Link>
              {" · "}
              <Link href="/sitemap.xml">Sitemap</Link>
            </p>
            <div className={styles.credits}>
              <span>
                Developed by{" "}
                <a
                  href="https://www.linkedin.com/in/chaseforrester/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chase Forrester
                </a>
              </span>
              <span className={styles.sep} aria-hidden>
                ·
              </span>
              <a
                className={styles.creditsTechAid}
                href="https://www.techaidaustralia.com.au/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/tech-aid-logo.png"
                  alt=""
                  width={22}
                  height={22}
                />
                <strong>Tech Aid Australia</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
