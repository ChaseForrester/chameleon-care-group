"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import styles from "../admin.module.css";
import { getInquiries } from "@/lib/cms";

export default function AdminInquiriesPage() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        getInquiries().then(setItems);
    }, []);

    return (
        <AdminShell
            title="Inquiries"
            subtitle="Messages from contact, booking and referral forms."
        >
            <div className={styles.panel}>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>When</th>
                                <th>Source</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleString("en-AU")
                                            : "—"}
                                    </td>
                                    <td>{item.source || "—"}</td>
                                    <td>
                                        <strong>{item.name}</strong>
                                        <div style={{ fontSize: "0.85rem" }}>{item.subject}</div>
                                    </td>
                                    <td>
                                        <div>{item.email}</div>
                                        <div>{item.phone}</div>
                                    </td>
                                    <td style={{ maxWidth: 320 }}>{item.message}</td>
                                </tr>
                            ))}
                            {!items.length && (
                                <tr>
                                    <td colSpan={5}>
                                        No inquiries yet. They will appear here once forms are
                                        submitted and Firestore is enabled.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminShell>
    );
}
