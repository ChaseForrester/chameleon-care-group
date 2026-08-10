"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/seedData";

export default function MobileCta() {
    const pathname = usePathname();
    if (
        pathname?.startsWith("/admin") ||
        pathname?.startsWith("/book-with-us")
    ) {
        return null;
    }

    return (
        <div className="mobile-cta" aria-label="Quick actions">
            <a href={SITE.phoneHref} className="btn btn-outline btn-sm">
                Call
            </a>
            <Link href="/book-with-us" className="btn btn-primary btn-sm">
                Book with us
            </Link>
        </div>
    );
}
