"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/admin/admin.module.css";

const NAV = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/blogs", label: "Blogs" },
    { href: "/admin/offers", label: "Offers & campaigns" },
    { href: "/admin/stories", label: "Success stories" },
    { href: "/admin/services", label: "Services" },
    { href: "/admin/laws", label: "Laws & documents" },
    { href: "/admin/pages", label: "Page content" },
    { href: "/admin/inquiries", label: "Inquiries" },
    { href: "/admin/settings", label: "Settings & seed" },
];

export default function AdminShell({ children, title, subtitle, action }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, isAdmin, signOut } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/admin/login");
        }
    }, [loading, user, router]);

    if (loading) {
        return <div className={styles.loading}>Loading admin…</div>;
    }

    if (!user) {
        return <div className={styles.loading}>Redirecting to login…</div>;
    }

    if (!isAdmin) {
        return (
            <div className={styles.loading}>
                <div>
                    <p>You are signed in but not authorised as an admin.</p>
                    <button type="button" className="btn btn-outline" onClick={signOut}>
                        Sign out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <strong>Chameleon Care</strong>
                    <span>Super Admin</span>
                </div>
                <nav className={styles.nav}>
                    {NAV.map((item) => {
                        const active = item.exact
                            ? pathname === item.href
                            : pathname?.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={active ? styles.active : ""}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className={styles.sideFooter}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-on-dark-muted)" }}>
                        {user.email}
                    </span>
                    <Link href="/" target="_blank">
                        View website
                    </Link>
                    <button type="button" onClick={() => signOut()}>
                        Sign out
                    </button>
                </div>
            </aside>
            <div className={styles.main}>
                <div className={styles.topbar}>
                    <div>
                        <h1>{title}</h1>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    {action}
                </div>
                {children}
            </div>
        </div>
    );
}
