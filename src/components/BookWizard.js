"use client";

import { useEffect, useMemo, useState } from "react";
import { buildMailto, NOTIFY_EMAILS } from "@/lib/emails";
import styles from "./BookWizard.module.css";

const STEPS = [
    { id: "welcome", title: "Welcome", icon: "👋" },
    { id: "ndis", title: "NDIS", icon: "♿" },
    { id: "medicare", title: "Medicare", icon: "📚" },
    { id: "gender", title: "Gender", icon: "❓" },
    { id: "health", title: "Health", icon: "🩺" },
    { id: "contact", title: "Contact", icon: "📞" },
    { id: "documents", title: "Documents", icon: "📄" },
    { id: "billing", title: "Billing", icon: "💳" },
    { id: "review", title: "Submit", icon: "🙌" },
];

const SERVICE_OPTIONS = [
    "Personal care",
    "Community access",
    "Respite / overnight",
    "Nursing / clinical",
    "Continence assessment",
    "Clinical reporting",
    "Not sure yet",
];

const empty = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    preferredSuburb: "",
    ndisNumber: "",
    fundingType: "",
    planManagerName: "",
    preferredServices: "",
    preferredContactTime: "",
    medicareNumber: "",
    medicareIrn: "",
    gender: "",
    allergicReactions: "",
    anaphylaxisRisk: "",
    asthma: "",
    behaviours: "",
    medicationRequired: "",
    otherHealthcareNeeds: "",
    dietaryRestrictions: "",
    healthDetails: "",
    contactRole: "Parent",
    address: "",
    contactFullName: "",
    contactMobile: "",
    contactEmail: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    anythingElse: "",
    documentNames: "",
    organisationName: "",
    organisationDetails: "",
    invoiceEmail: "",
    planDates: "",
    lineItem: "",
    privacyConsent: false,
    agreed: false,
};

function Field({ label, required, children, hint }) {
    return (
        <div className="form-field">
            <label>
                {label}
                {required && <span className="required"> *</span>}
            </label>
            {hint && <span className="hint">{hint}</span>}
            {children}
        </div>
    );
}

function YesNo({ name, value, onChange, label, required }) {
    return (
        <div className="form-field">
            <label>
                {label}
                {required && <span className="required"> *</span>}
            </label>
            <div className="choice-grid">
                {["Yes", "No"].map((opt) => (
                    <label
                        key={opt}
                        className={`choice ${value === opt ? "selected" : ""}`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={opt}
                            checked={value === opt}
                            onChange={onChange}
                        />
                        {opt}
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function BookWizard() {
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [form, setForm] = useState(empty);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("idle");
    const [animKey, setAnimKey] = useState(0);

    const progress = useMemo(
        () => Math.round(((step + 1) / STEPS.length) * 100),
        [step]
    );

    useEffect(() => {
        setAnimKey((k) => k + 1);
    }, [step]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
        setError("");
    };

    const validate = () => {
        const s = STEPS[step].id;
        if (s === "welcome") {
            if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
                return "Please complete all required fields (including phone).";
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                return "Please enter a valid email address.";
            }
            if (!form.preferredSuburb.trim()) {
                return "Please enter the suburb where support is needed.";
            }
        }
        if (s === "ndis") {
            if (!form.fundingType) {
                return "Please select how supports will be funded.";
            }
            if (!form.preferredServices) {
                return "Please select at least one preferred service.";
            }
        }
        if (s === "gender" && !form.gender) {
            return "Please select a gender option.";
        }
        if (s === "health") {
            const req = [
                "allergicReactions",
                "anaphylaxisRisk",
                "asthma",
                "behaviours",
                "medicationRequired",
                "otherHealthcareNeeds",
                "dietaryRestrictions",
            ];
            if (req.some((k) => !form[k])) {
                return "Please answer all health questions.";
            }
        }
        if (s === "contact") {
            if (
                !form.address.trim() ||
                !form.contactFullName.trim() ||
                !form.contactMobile.trim() ||
                !form.contactEmail.trim()
            ) {
                return "Please complete all required contact fields.";
            }
        }
        if (s === "billing") {
            if (!form.invoiceEmail.trim()) {
                return "Invoice email is required.";
            }
        }
        if (s === "review") {
            if (!form.privacyConsent) {
                return "Please consent to our Privacy Policy before submitting.";
            }
            if (!form.agreed) {
                return "Please agree to the terms before submitting.";
            }
        }
        return "";
    };

    const go = (next) => {
        if (next > step) {
            const err = validate();
            if (err) {
                setError(err);
                return;
            }
        }
        setError("");
        setDir(next > step ? 1 : -1);
        setStep(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onSubmit = async () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setStatus("loading");
        setError("");
        try {
            const { submitInquiry } = await import("@/lib/cms");
            await submitInquiry({
                source: "book-wizard",
                name: `${form.firstName} ${form.lastName}`.trim(),
                email: form.email,
                phone: form.phone,
                subject: "Book in application",
                message: JSON.stringify(form, null, 2),
                ...form,
            });
            setStatus("success");
        } catch {
            window.location.href = buildMailto({
                subject: "Book with us application",
                body: Object.entries(form)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n"),
            });
            setStatus("success");
        }
    };

    if (status === "success") {
        return (
            <div className={`${styles.card} ${styles.success}`}>
                <div className={styles.successIcon}>✓</div>
                <h2>Done! Thank you!</h2>
                <p>
                    Your submission has been received by our team
                    ({NOTIFY_EMAILS.join(" & ")}). We will be in touch shortly.
                    For urgent needs, call{" "}
                    <a href="tel:0430068300">0430 068 300</a>.
                </p>
            </div>
        );
    }

    const s = STEPS[step];

    return (
        <div className={styles.wrap}>
            <div className={styles.progressBlock}>
                <div className={styles.progressMeta}>
                    <span>
                        Step {step + 1} of {STEPS.length}
                    </span>
                    <strong>{s.title}</strong>
                </div>
                <div className={styles.bar} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className={styles.fill} style={{ width: `${progress}%` }} />
                </div>
                <div className={styles.stepDots}>
                    {STEPS.map((st, i) => (
                        <button
                            key={st.id}
                            type="button"
                            className={`${styles.dot} ${i === step ? styles.dotActive : ""} ${i < step ? styles.dotDone : ""
                                }`}
                            aria-label={st.title}
                            onClick={() => i < step && go(i)}
                            disabled={i > step}
                        >
                            <span className={styles.dotIcon}>{st.icon}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div
                key={animKey}
                className={`${styles.card} ${dir >= 0 ? styles.slideNext : styles.slideBack
                    }`}
            >
                <div className={styles.stepHead}>
                    <span className={styles.emoji} aria-hidden>
                        {s.icon}
                    </span>
                    {s.id === "welcome" && (
                        <>
                            <h2>Welcome to the Chameleon Care application</h2>
                            <p>Please fill the following fields to get started.</p>
                        </>
                    )}
                    {s.id === "ndis" && (
                        <>
                            <h2>NDIS & support needs</h2>
                            <p>Tell us about funding and the supports you&apos;re looking for.</p>
                        </>
                    )}
                    {s.id === "medicare" && (
                        <>
                            <h2>Medicare number</h2>
                            <p>Enter your Medicare details (if known).</p>
                        </>
                    )}
                    {s.id === "gender" && (
                        <>
                            <h2>Gender</h2>
                            <p>What gender are you?</p>
                        </>
                    )}
                    {s.id === "health" && (
                        <>
                            <h2>Health assessment form</h2>
                            <p>
                                Tell us about your health — this information is key to our care
                                for you.
                            </p>
                        </>
                    )}
                    {s.id === "contact" && (
                        <>
                            <h2>Contact information</h2>
                            <p>Tell us how we can get back to you.</p>
                        </>
                    )}
                    {s.id === "documents" && (
                        <>
                            <h2>Any supporting documents</h2>
                            <p>
                                List any documents you can provide (NDIS plan, reports, etc.).
                                You can email files after submitting.
                            </p>
                        </>
                    )}
                    {s.id === "billing" && (
                        <>
                            <h2>Accounts & billing</h2>
                            <p>Organisation name or self-managed person&apos;s name.</p>
                        </>
                    )}
                    {s.id === "review" && (
                        <>
                            <h2>You did it!</h2>
                            <p>All that&apos;s left is to hit the submit button.</p>
                        </>
                    )}
                </div>

                <div className={styles.fields}>
                    {s.id === "welcome" && (
                        <>
                            <div className={styles.row}>
                                <Field label="First name" required>
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={onChange}
                                        autoComplete="given-name"
                                        required
                                    />
                                </Field>
                                <Field label="Last name" required>
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={onChange}
                                        autoComplete="family-name"
                                        required
                                    />
                                </Field>
                            </div>
                            <div className={styles.row}>
                                <Field label="Phone number" required>
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={onChange}
                                        autoComplete="tel"
                                        placeholder="04xx xxx xxx"
                                        required
                                    />
                                </Field>
                                <Field label="Date of birth">
                                    <input
                                        name="dateOfBirth"
                                        type="date"
                                        value={form.dateOfBirth}
                                        onChange={onChange}
                                    />
                                </Field>
                            </div>
                            <Field label="E-mail address" required>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={onChange}
                                    autoComplete="email"
                                    required
                                />
                            </Field>
                            <Field
                                label="Suburb where support is needed"
                                required
                                hint="e.g. Cronulla, Miranda, Wollongong, Gosford"
                            >
                                <input
                                    name="preferredSuburb"
                                    value={form.preferredSuburb}
                                    onChange={onChange}
                                    required
                                />
                            </Field>
                            <Field label="Preferred contact time">
                                <select
                                    name="preferredContactTime"
                                    value={form.preferredContactTime}
                                    onChange={onChange}
                                >
                                    <option value="">Select…</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Afternoon">Afternoon</option>
                                    <option value="Anytime">Anytime</option>
                                </select>
                            </Field>
                        </>
                    )}

                    {s.id === "ndis" && (
                        <>
                            <Field label="NDIS participant number (if known)">
                                <input
                                    name="ndisNumber"
                                    value={form.ndisNumber}
                                    onChange={onChange}
                                    placeholder="e.g. 43xxxxxxx"
                                />
                            </Field>
                            <Field label="How will supports be funded?" required>
                                <div className="choice-grid">
                                    {[
                                        "NDIS – Agency managed",
                                        "NDIS – Plan managed",
                                        "NDIS – Self managed",
                                        "Private / other",
                                        "Not sure yet",
                                    ].map((opt) => (
                                        <label
                                            key={opt}
                                            className={`choice ${form.fundingType === opt ? "selected" : ""
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="fundingType"
                                                value={opt}
                                                checked={form.fundingType === opt}
                                                onChange={onChange}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Plan manager name (if plan managed)">
                                <input
                                    name="planManagerName"
                                    value={form.planManagerName}
                                    onChange={onChange}
                                />
                            </Field>
                            <Field label="Preferred services" required>
                                <div className="choice-grid">
                                    {SERVICE_OPTIONS.map((opt) => {
                                        const selected = (form.preferredServices || "")
                                            .split("|")
                                            .filter(Boolean)
                                            .includes(opt);
                                        return (
                                            <label
                                                key={opt}
                                                className={`choice ${selected ? "selected" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => {
                                                        const cur = (form.preferredServices || "")
                                                            .split("|")
                                                            .filter(Boolean);
                                                        const next = selected
                                                            ? cur.filter((x) => x !== opt)
                                                            : [...cur, opt];
                                                        setForm((f) => ({
                                                            ...f,
                                                            preferredServices: next.join("|"),
                                                        }));
                                                        setError("");
                                                    }}
                                                />
                                                {opt}
                                            </label>
                                        );
                                    })}
                                </div>
                            </Field>
                        </>
                    )}

                    {s.id === "medicare" && (
                        <>
                            <Field label="Medicare number">
                                <input
                                    name="medicareNumber"
                                    value={form.medicareNumber}
                                    onChange={onChange}
                                    inputMode="numeric"
                                    placeholder="XXXX XXXXX X"
                                />
                            </Field>
                            <Field label="Medicare individual reference number">
                                <input
                                    name="medicareIrn"
                                    value={form.medicareIrn}
                                    onChange={onChange}
                                    inputMode="numeric"
                                    maxLength={2}
                                    placeholder="e.g. 1"
                                />
                            </Field>
                        </>
                    )}

                    {s.id === "gender" && (
                        <Field label="Male or Female" required>
                            <div className="choice-grid">
                                {["Male", "Female", "Prefer not to say"].map((opt) => (
                                    <label
                                        key={opt}
                                        className={`choice ${form.gender === opt ? "selected" : ""
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={opt}
                                            checked={form.gender === opt}
                                            onChange={onChange}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </Field>
                    )}

                    {s.id === "health" && (
                        <>
                            <YesNo
                                name="allergicReactions"
                                value={form.allergicReactions}
                                onChange={onChange}
                                label="Have you been diagnosed with any allergic reactions?"
                                required
                            />
                            <YesNo
                                name="anaphylaxisRisk"
                                value={form.anaphylaxisRisk}
                                onChange={onChange}
                                label="Have you been diagnosed as at risk of Anaphylaxis?"
                                required
                            />
                            <YesNo
                                name="asthma"
                                value={form.asthma}
                                onChange={onChange}
                                label="Have you been diagnosed with Asthma?"
                                required
                            />
                            <YesNo
                                name="behaviours"
                                value={form.behaviours}
                                onChange={onChange}
                                label="Any behaviours that we should be aware of?"
                                required
                            />
                            <YesNo
                                name="medicationRequired"
                                value={form.medicationRequired}
                                onChange={onChange}
                                label="Will you require medication to be administered whilst attending programs?"
                                required
                            />
                            <YesNo
                                name="otherHealthcareNeeds"
                                value={form.otherHealthcareNeeds}
                                onChange={onChange}
                                label="Do you have any other specific healthcare needs, including any other medical conditions?"
                                required
                            />
                            <YesNo
                                name="dietaryRestrictions"
                                value={form.dietaryRestrictions}
                                onChange={onChange}
                                label="Any dietary restrictions?"
                                required
                            />
                            <Field
                                label="If answered YES above, please provide all relevant details"
                            >
                                <textarea
                                    name="healthDetails"
                                    value={form.healthDetails}
                                    onChange={onChange}
                                    placeholder="Allergies, medications, behaviours, dietary needs..."
                                />
                            </Field>
                        </>
                    )}

                    {s.id === "contact" && (
                        <>
                            <Field label="I am a" required>
                                <div className="choice-grid">
                                    {[
                                        "Parent",
                                        "Carer",
                                        "Emergency Contact",
                                        "Family Member",
                                        "Self",
                                        "Support Coordinator",
                                    ].map((opt) => (
                                        <label
                                            key={opt}
                                            className={`choice ${form.contactRole === opt ? "selected" : ""
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="contactRole"
                                                value={opt}
                                                checked={form.contactRole === opt}
                                                onChange={onChange}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Current address" required>
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={onChange}
                                    autoComplete="street-address"
                                />
                            </Field>
                            <Field label="Full name" required>
                                <input
                                    name="contactFullName"
                                    value={form.contactFullName}
                                    onChange={onChange}
                                />
                            </Field>
                            <div className={styles.row}>
                                <Field label="Mobile" required>
                                    <input
                                        name="contactMobile"
                                        type="tel"
                                        value={form.contactMobile}
                                        onChange={onChange}
                                    />
                                </Field>
                                <Field label="Email" required>
                                    <input
                                        name="contactEmail"
                                        type="email"
                                        value={form.contactEmail}
                                        onChange={onChange}
                                    />
                                </Field>
                            </div>
                            <div className={styles.row}>
                                <Field label="Emergency contact name">
                                    <input
                                        name="emergencyContactName"
                                        value={form.emergencyContactName}
                                        onChange={onChange}
                                    />
                                </Field>
                                <Field label="Emergency contact phone">
                                    <input
                                        name="emergencyContactPhone"
                                        type="tel"
                                        value={form.emergencyContactPhone}
                                        onChange={onChange}
                                    />
                                </Field>
                            </div>
                            <Field label="Is there anything else we should know?">
                                <textarea
                                    name="anythingElse"
                                    value={form.anythingElse}
                                    onChange={onChange}
                                />
                            </Field>
                        </>
                    )}

                    {s.id === "documents" && (
                        <Field
                            label="Document names / notes"
                            hint="e.g. NDIS plan, medical reports, referral letter. Email attachments to chameleonnursingcare@gmail.com and hello@techaidaustralia.com.au after submitting."
                        >
                            <textarea
                                name="documentNames"
                                value={form.documentNames}
                                onChange={onChange}
                                placeholder="List documents you will provide..."
                            />
                        </Field>
                    )}

                    {s.id === "billing" && (
                        <>
                            <Field label="Organisation or self-managed person's name">
                                <input
                                    name="organisationName"
                                    value={form.organisationName}
                                    onChange={onChange}
                                />
                            </Field>
                            <Field label="Organisation details">
                                <textarea
                                    name="organisationDetails"
                                    value={form.organisationDetails}
                                    onChange={onChange}
                                    placeholder="Plan manager, coordinator, ABN if known..."
                                />
                            </Field>
                            <Field label="Invoice email address" required>
                                <input
                                    name="invoiceEmail"
                                    type="email"
                                    value={form.invoiceEmail}
                                    onChange={onChange}
                                />
                            </Field>
                            <Field label="Plan dates">
                                <input
                                    name="planDates"
                                    value={form.planDates}
                                    onChange={onChange}
                                    placeholder="e.g. 01/07/2026 – 30/06/2027"
                                />
                            </Field>
                            <Field label="Line item to invoice (if known)">
                                <input
                                    name="lineItem"
                                    value={form.lineItem}
                                    onChange={onChange}
                                />
                            </Field>
                        </>
                    )}

                    {s.id === "review" && (
                        <div className={styles.review}>
                            <div className={styles.summary}>
                                <h3>Application summary</h3>
                                <p>
                                    <strong>Participant:</strong> {form.firstName} {form.lastName}
                                </p>
                                <p>
                                    <strong>Email:</strong> {form.email}
                                </p>
                                <p>
                                    <strong>Phone:</strong> {form.phone || "—"}
                                </p>
                                <p>
                                    <strong>Suburb:</strong> {form.preferredSuburb || "—"}
                                </p>
                                <p>
                                    <strong>Funding:</strong> {form.fundingType || "—"}
                                </p>
                                <p>
                                    <strong>Services:</strong>{" "}
                                    {(form.preferredServices || "").split("|").filter(Boolean).join(", ") || "—"}
                                </p>
                                <p>
                                    <strong>Contact:</strong> {form.contactFullName} (
                                    {form.contactRole})
                                </p>
                                <p>
                                    <strong>Address:</strong> {form.address || "—"}
                                </p>
                            </div>
                            <label className={styles.agree}>
                                <input
                                    type="checkbox"
                                    name="privacyConsent"
                                    checked={form.privacyConsent}
                                    onChange={onChange}
                                />
                                <span>
                                    I consent to Chameleon Care Group collecting and using the
                                    personal and health information in this form in accordance with
                                    the{" "}
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                                        Privacy Policy
                                    </a>
                                    .
                                </span>
                            </label>
                            <label className={styles.agree}>
                                <input
                                    type="checkbox"
                                    name="agreed"
                                    checked={form.agreed}
                                    onChange={onChange}
                                />
                                <span>
                                    I have read and agree to the{" "}
                                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                                        Terms and Conditions
                                    </a>
                                    . The information provided is accurate and I consent to being
                                    contacted about this application.
                                </span>
                            </label>
                        </div>
                    )}
                </div>

                {error && <p className={`form-error ${styles.error}`}>{error}</p>}

                <div className={styles.nav}>
                    {step > 0 ? (
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => go(step - 1)}
                        >
                            ← Back
                        </button>
                    ) : (
                        <span />
                    )}
                    {step < STEPS.length - 1 ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => go(step + 1)}
                        >
                            Next step →
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-accent"
                            disabled={status === "loading"}
                            onClick={onSubmit}
                        >
                            {status === "loading" ? "Submitting…" : "Submit application"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
