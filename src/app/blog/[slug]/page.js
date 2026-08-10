import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DEFAULT_BLOGS } from "@/lib/seedData";
import styles from "./page.module.css";

export function generateStaticParams() {
    return DEFAULT_BLOGS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = DEFAULT_BLOGS.find((b) => b.slug === slug);
    if (!post) return { title: "Article" };
    return {
        title: post.title,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const post = DEFAULT_BLOGS.find((b) => b.slug === slug);
    if (!post) notFound();

    const paragraphs = (post.content || "").split("\n\n");

    return (
        <>
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
                </div>
            </section>

            <section className="section">
                <div className="container">
                    {post.coverImage && (
                        <div className={styles.cover}>
                            <Image src={post.coverImage} alt="" width={960} height={480} />
                        </div>
                    )}
                    <article className="prose">
                        {paragraphs.map((block, i) => {
                            if (block.startsWith("## ")) {
                                return <h2 key={i}>{block.replace("## ", "")}</h2>;
                            }
                            if (block.startsWith("- ")) {
                                const items = block.split("\n").filter(Boolean);
                                return (
                                    <ul key={i}>
                                        {items.map((li) => (
                                            <li key={li}>{li.replace(/^- /, "")}</li>
                                        ))}
                                    </ul>
                                );
                            }
                            return <p key={i}>{block}</p>;
                        })}
                    </article>
                </div>
            </section>
        </>
    );
}
