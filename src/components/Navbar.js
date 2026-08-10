"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { SITE } from "@/lib/seedData";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/locations", label: "Areas" },
  { href: "/about-us", label: "About" },
  { href: "/success-stories", label: "Stories" },
  { href: "/blog", label: "Blog" },
  { href: "/contact-us", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${open ? styles.menuOpen : ""
        }`}
    >
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Chameleon Care Group home">
          <Image
            src="/images/logo-nav.png"
            alt=""
            width={48}
            height={48}
            priority
            className={styles.mark}
          />
          <span className={styles.wordmark}>
            <span className={styles.wordTop}>Chameleon Care</span>
            <span className={styles.wordBottom}>Group</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${active ? styles.active : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <a href={SITE.phoneHref} className={styles.phone}>
            {SITE.phone}
          </a>
          <Link href="/book-with-us" className="btn btn-primary btn-sm">
            Book with us
          </Link>
        </div>

        <button
          type="button"
          className={styles.burger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`${styles.mobile} ${open ? styles.mobileOpen : ""}`}>
        <nav aria-label="Mobile">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.mobileLink}>
              {link.label}
            </Link>
          ))}
          <Link href="/book-with-us" className="btn btn-primary btn-block">
            Book with us
          </Link>
          <a href={SITE.phoneHref} className={styles.mobilePhone}>
            Call {SITE.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
