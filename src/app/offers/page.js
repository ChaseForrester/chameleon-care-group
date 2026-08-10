import styles from "./page.module.css";
import { OffersGrid } from "@/components/DynamicContent";

export const metadata = {
    title: "Offers & Campaigns",
    description: "Current promotions and campaigns from Chameleon Care Group.",
};

export default function OffersPage() {
    return (
        <>
            <section className="page-hero">
                <div className="container">
                    <span
                        className="eyebrow"
                        style={{ color: "var(--color-brand-green)" }}
                    >
                        Offers
                    </span>
                    <h1>Promotions & campaigns</h1>
                    <p>Current ways to get started with Chameleon Care Group.</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <OffersGrid styles={styles} />
                </div>
            </section>
        </>
    );
}
