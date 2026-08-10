"use client";

import { useState } from "react";
import styles from "./FAQ.module.css";
import { FAQ_ITEMS } from "@/lib/seedData";

export default function FAQ({ items = FAQ_ITEMS }) {
    const [open, setOpen] = useState(0);

    return (
        <div className={styles.list}>
            {items.map((item, i) => {
                const isOpen = open === i;
                return (
                    <div
                        key={item.q}
                        className={`${styles.item} ${isOpen ? styles.open : ""}`}
                    >
                        <button
                            type="button"
                            className={styles.trigger}
                            aria-expanded={isOpen}
                            onClick={() => setOpen(isOpen ? -1 : i)}
                        >
                            <span>{item.q}</span>
                            <span className={styles.icon} aria-hidden>
                                {isOpen ? "−" : "+"}
                            </span>
                        </button>
                        <div
                            className={styles.panel}
                            style={{
                                maxHeight: isOpen ? "240px" : "0",
                                opacity: isOpen ? 1 : 0,
                            }}
                        >
                            <p>{item.a}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
