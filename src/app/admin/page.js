"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "./admin.module.css";
import {
    getBlogs,
    getOffers,
    getStories,
    getServices,
    getInquiries,
} from "@/lib/cms";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        blogs: 0,
        offers: 0,
        stories: 0,
        services: 0,
        inquiries: 0,
    });

    useEffect(() => {
        (async () => {
            const [blogs, offers, stories, services, inquiries] = await Promise.all([
                getBlogs({ publishedOnly: false }),
                getOffers({ publishedOnly: false }),
                getStories({ publishedOnly: false }),
                getServices({ publishedOnly: false }),
                getInquiries(),
            ]);
            setStats({
                blogs: blogs?.length || 0,
                offers: offers?.length || 0,
                stories: stories?.length || 0,
                services: services?.length || 0,
                inquiries: inquiries?.length || 0,
            });
        })();
    }, []);

    return (
        <AdminShell
            title="Dashboard"
            subtitle="Manage your website content without a developer."
        >
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <strong>{stats.blogs}</strong>
                    <span>Blog posts</span>
                </div>
                <div className={styles.stat}>
                    <strong>{stats.offers}</strong>
                    <span>Offers / campaigns</span>
                </div>
                <div className={styles.stat}>
                    <strong>{stats.stories}</strong>
                    <span>Success stories</span>
                </div>
                <div className={styles.stat}>
                    <strong>{stats.inquiries}</strong>
                    <span>Inquiries</span>
                </div>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>Quick actions</h2>
                </div>
                <div className={styles.quickGrid}>
                    <Link href="/admin/blogs" className={styles.quickCard}>
                        <strong>Write a blog</strong>
                        <span>Upload and publish articles for participants & families.</span>
                    </Link>
                    <Link href="/admin/offers" className={styles.quickCard}>
                        <strong>Create an offer</strong>
                        <span>Launch promotional campaigns and CTAs.</span>
                    </Link>
                    <Link href="/admin/stories" className={styles.quickCard}>
                        <strong>Add a success story</strong>
                        <span>Publish case studies with participant consent.</span>
                    </Link>
                    <Link href="/admin/services" className={styles.quickCard}>
                        <strong>Update services</strong>
                        <span>Keep service info current as the business grows.</span>
                    </Link>
                    <Link href="/admin/pages" className={styles.quickCard}>
                        <strong>Edit page content</strong>
                        <span>Change headlines and copy without a developer.</span>
                    </Link>
                    <Link href="/admin/settings" className={styles.quickCard}>
                        <strong>Seed & settings</strong>
                        <span>Load starter content into Firebase Firestore.</span>
                    </Link>
                </div>
            </div>
        </AdminShell>
    );
}
