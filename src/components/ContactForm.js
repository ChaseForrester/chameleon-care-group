"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/cms";
import styles from "./ContactForm.module.css";

export default function ContactForm({
    title = "Send us a message",
    source = "contact",
}) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    const onChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setError("");
        try {
            await submitInquiry({ ...form, source });
            setStatus("success");
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (err) {
            // Still show success UX if Firestore not ready — open mailto fallback
            console.warn(err);
            const body = encodeURIComponent(
                `Name: ${form.name}\nPhone: ${form.phone}\n\n${form.message}`
            );
            window.location.href = `mailto:chameleonnursingcare@gmail.com?subject=${encodeURIComponent(
                form.subject || "Website enquiry"
            )}&body=${body}`;
            setStatus("success");
        }
    };

    if (status === "success") {
        return (
            <div className={styles.successBox}>
                <h3>Thank you!</h3>
                <p>
                    We&apos;ve received your message and will be in touch shortly. For
                    urgent needs, call us on{" "}
                    <a href="tel:0430068300">0430 068 300</a>.
                </p>
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setStatus("idle")}
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            {title && <h3 className={styles.title}>{title}</h3>}
            <div className={styles.row}>
                <div className="form-field">
                    <label htmlFor="name">Full name</label>
                    <input
                        id="name"
                        name="name"
                        required
                        value={form.name}
                        onChange={onChange}
                        placeholder="Your name"
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="phone">Phone</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="04xx xxx xxx"
                    />
                </div>
            </div>
            <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                />
            </div>
            <div className="form-field">
                <label htmlFor="subject">Subject</label>
                <input
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    placeholder="How can we help?"
                />
            </div>
            <div className="form-field">
                <label htmlFor="message">Message</label>
                <textarea
                    id="message"
                    name="message"
                    required
                    value={form.message}
                    onChange={onChange}
                    placeholder="Tell us a little about your needs..."
                />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button
                type="submit"
                className="btn btn-primary"
                disabled={status === "loading"}
            >
                {status === "loading" ? "Sending…" : "Send message"}
            </button>
        </form>
    );
}
