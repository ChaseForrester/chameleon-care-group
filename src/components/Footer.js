"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";
import { SITE } from "@/lib/seedData";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <Image
            src="/images/logo.png"
            alt="Chameleon Care Group"
            width={200}
            height={36}
            className={styles.logo}
          />
          <p>
            Dedication to improving lives with individual-focused and
            community-oriented services. Personalised NDIS, aged care, and
            private nursing that adapts to you.
          </p>
          <div className={styles.socials}>
            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              Facebook
            </a>
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              Instagram
            </a>
          </div>
          <Image
            src="/images/ndis.png"
            alt="NDIS provider"
            width={72}
            height={72}
            className={styles.ndis}
          />
        </div>

        <div className={styles.col}>
          <h4>Explore</h4>
          <Link href="/">Home</Link>
          <Link href="/about">About us</Link>
          <Link href="/services">Services</Link>
          <Link href="/success-stories">Success stories</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/offers">Offers</Link>
        </div>

        <div className={styles.col}>
          <h4>Get started</h4>
          <Link href="/book">Book with us</Link>
          <Link href="/referral">Referral</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/admin">Admin login</Link>
        </div>

        <div className={styles.col}>
          <h4>Get in touch</h4>
          <a href={SITE.emailHref}>{SITE.email}</a>
          <a href={SITE.phoneHref}>{SITE.phone}</a>
          <p className={styles.meta}>{SITE.locations}</p>
          <p className={styles.meta}>{SITE.afterHours}</p>
        </div>
      </div>

      <div className={styles.hoursBar}>
        <div className="container">
          <div className={styles.hours}>
            {SITE.hours.map((h) => (
              <div key={h.day} className={styles.hourItem}>
                <span>{h.day}</span>
                <strong>{h.hours}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.ack}>{SITE.acknowledgement}</p>
          <div className={styles.copy}>
            <p>
              © {new Date().getFullYear()} Chameleon Care Group. All rights
              reserved.
            </p>
            <p>
              Visuals by{" "}
              <a
                href="https://www.linkedin.com/in/chaseforrester"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chase Forrester
              </a>
              {" · "}
              Built by{" "}
              <a
                href="https://www.techaidaustralia.com.au"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tech Aid Australia
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
