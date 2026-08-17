import Link from "next/link";
import { notFound } from "next/navigation";
import CmsImage from "@/components/CmsImage";
import { DEFAULT_BLOGS } from "@/lib/seedData";
import {
    absoluteUrl,
    blogJsonLd,
    blogShareImage,
    buildBlogMetadata,
    resolveBlogPost,
} from "@/lib/blogShare";
import ShareButtons from "@/components/ShareButtons";
import { legacyContentToHtml, sanitizeBlogHtml } from "@/lib/htmlContent";
import styles from "./page.module.css";
import shareStyles from "@/components/ShareButtons.module.css";

export function generateStaticParams() {
    return DEFAULT_BLOGS.map((b) => ({ slug: b.slug }));
}

// Allow CMS-created slugs that aren't in the seed list
export const dynamicParams = true;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await resolveBlogPost(slug);
    if (!post) {
        return {
            title: "Article",
            description: "Chameleon Care Group blog",
        };
    }
    return buildBlogMetadata(post, slug);
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const post = await resolveBlogPost(slug);
    if (!post) notFound();

    const bodyHtml = sanitizeBlogHtml(legacyContentToHtml(post.content || ""));
    const shareUrl = absoluteUrl(`/blog/${post.slug || slug}`);
    const shareImage = blogShareImage(post);
    const jsonLd = blogJsonLd(post, slug);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <section className="page-hero">
                <div className="container">
                    <Link href="/blog" className={styles.back}>
                        ← Back to blog
                    </Link>
                    <h1>{post.title}</h1>
                    <p>{post.excerpt}</p>
                    <div className={styles.meta}>
                        <span>{post.author || "Chameleon Care Group"}</span>
                        {post.publishedAt && (
                            <span>
                                {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        )}
                    </div>
                    <ShareButtons
                        url={shareUrl}
                        title={post.title}
                        text={post.excerpt || ""}
                        image={shareImage}
                        label="Share this article"
                        className={shareStyles.onDark}
                    />
                </div>
            </section>

            <section className="section">
                <div className="container">
                    {post.coverImage && (
                        <div className={styles.cover}>
                            <CmsImage
                                src={
                                    post.coverImage.endsWith(".webp")
                                        ? post.coverImage.replace(".webp", ".jpg")
                                        : post.coverImage
                                }
                                alt={post.title || "Blog cover"}
                                width={1600}
                                height={900}
                                sizes="(max-width: 980px) 100vw, 960px"
                                style={{ width: "100%", height: "auto" }}
                                priority
                            />
                        </div>
                    )}
                    <article
                        className="prose"
                        dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />

                    <div className={styles.shareFooter}>
                        <ShareButtons
                            url={shareUrl}
                            title={post.title}
                            text={post.excerpt || ""}
                            image={shareImage}
                            label="Share this article"
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
