/** Fallback content used when Firestore is empty or offline. */

export const SITE = {
  name: "Chameleon Care Group",
  tagline: "Blending In. Standing Out.",
  phone: "0430 068 300",
  phoneHref: "tel:0430068300",
  email: "chameleonnursingcare@gmail.com",
  emailHref: "mailto:chameleonnursingcare@gmail.com",
  locations: "Illawarra · Central Coast · Sydney",
  region: "Sutherland Shire & Greater Sydney",
  abn: "21 518 018 965",
  abnHref: "https://abr.business.gov.au/ABN/View?id=21518018965",
  googleBusiness: "https://share.google/46T8pcFGRhDaphipj",
  googleReviews: "https://g.page/r/CfVeH5GtaSdMEAI/review",
  hours: [
    { day: "Monday", hours: "9:00am – 5:00pm" },
    { day: "Tuesday", hours: "9:00am – 5:00pm" },
    { day: "Wednesday", hours: "9:00am – 5:00pm" },
    { day: "Thursday", hours: "9:00am – 5:00pm" },
    { day: "Friday", hours: "9:00am – 5:00pm" },
    { day: "Saturday", hours: "Closed" },
    { day: "Sunday", hours: "Closed" },
  ],
  afterHours: "After hours — please call 0430 068 300",
  social: {
    facebook: "https://www.facebook.com/chameleoncaregroup/",
    instagram: "https://www.instagram.com/chameleon_care_group/",
  },
  acknowledgement:
    "We acknowledge the Traditional Custodians of the land on which we operate, the Dharawal people, and pay our respects to Elders past, present, and emerging.",
};

export const DEFAULT_SERVICES = [
  {
    id: "personal-care",
    title: "Personal Care & Daily Living",
    short:
      "Dignified personal care, medication support, and home assistance tailored to you.",
    description:
      "Personal care, medication management, general domestic assistance, and support to appointments — delivered with respect and flexibility in the comfort of your home.",
    icon: "heart",
    image: "/images/service-1.jpg",
    features: [
      "Personal care & hygiene support",
      "Medication management",
      "Domestic assistance",
      "Support to appointments",
    ],
    order: 1,
    published: true,
  },
  {
    id: "community-access",
    title: "Community Access & Skill Building",
    short:
      "Build confidence, skills, and connection through meaningful community participation.",
    description:
      "Develop and enhance everyday skills while accessing the community in ways that match your goals, interests, and NDIS plan.",
    icon: "users",
    image: "/images/service-2.jpg",
    features: [
      "Community participation",
      "Skill building programs",
      "Social & recreational support",
      "Transport support",
    ],
    order: 2,
    published: true,
  },
  {
    id: "respite-overnight",
    title: "Respite & Overnight Care",
    short:
      "Reliable respite and overnight support so families can rest and recharge.",
    description:
      "Flexible respite and overnight care designed to support participants and give families peace of mind — day or night.",
    icon: "moon",
    image: "/images/service-3.jpg",
    features: [
      "In-home respite",
      "Overnight support",
      "Flexible scheduling",
      "Experienced carers",
    ],
    order: 3,
    published: true,
  },
  {
    id: "complex-nursing",
    title: "Complex Nursing & Clinical Support",
    short:
      "AHPRA-registered nursing, behavioural support, and paediatric disability care.",
    description:
      "Clinical nursing, behavioural management, palliative support, and paediatric disability care delivered by a professional, compassionate team.",
    icon: "stethoscope",
    image: "/images/nurse-hero.jpg",
    features: [
      "In-home nursing",
      "Behavioural management",
      "Paediatric disability care",
      "Palliative support",
    ],
    order: 4,
    published: true,
  },
  {
    id: "continence-assessments",
    title: "NDIS Continence Assessments",
    short:
      "Thorough, NDIS-compliant continence assessments and product recommendations.",
    description:
      "Comprehensive continence assessments for NDIS participants, with clear recommendations and management plans that support dignity and independence.",
    icon: "clipboard",
    image: "/images/nurse-clinical.jpg",
    features: [
      "NDIS-compliant assessments",
      "Product recommendations",
      "Individualised management plans",
      "Planner-ready documentation",
    ],
    order: 5,
    published: true,
  },
  {
    id: "clinical-reporting",
    title: "Clinical Report Writing",
    short:
      "High-quality clinical reports trusted by planners and support coordinators.",
    description:
      "Detailed clinical reporting for NDIS plan reviews, ensuring participants receive appropriate funding and care packages.",
    icon: "file",
    image: "/images/clinical-report.jpg",
    features: [
      "NDIS-ready clinical justifications",
      "Complex care documentation",
      "Collaborative with coordinators",
      "Timely turnaround",
    ],
    order: 6,
    published: true,
  },
];

/**
 * Success stories from the original Webflow site
 * (https://chameleoncaregroup.webflow.io/) — published with consent.
 */
export const DEFAULT_STORIES = [
  {
    id: "erica",
    name: "Erica",
    location: "Sutherland Shire",
    quote:
      "They not only supported mum and our whole family but with their input and guidance we were able to make informed decisions for a peaceful and serene end of life experience.",
    published: true,
    consent: true,
    source: "webflow",
  },
  {
    id: "kim",
    name: "Kim",
    location: "Sutherland Shire",
    quote:
      "They have made a real difference to our lives and we are so grateful for their support. Their team of carers are all professional and caring.",
    published: true,
    consent: true,
    source: "webflow",
  },
  {
    id: "kelly",
    name: "Kelly",
    location: "Sutherland Shire",
    quote:
      "They were attentive, responsive and dedicated to making Dad's stay comfortable, fun and full. The team are highly skilled but most importantly genuinely caring and compassionate.",
    published: true,
    consent: true,
    source: "webflow",
  },
  {
    id: "ryan",
    name: "Ryan",
    location: "Gosford",
    quote:
      "The team's commitment to my sister's well-being is unmatched, and I am forever thankful for the positive impact they have made on our family. Thank you, Chameleon Care Group, for making such a difference!",
    published: true,
    consent: true,
    source: "webflow",
  },
];

export const DEFAULT_BLOGS = [
  {
    id: "welcome-to-ccg",
    slug: "welcome-to-chameleon-care-group",
    title: "Welcome to Chameleon Care Group",
    excerpt:
      "How person-centred NDIS support that adapts to you can transform everyday life.",
    content: `Chameleon Care Group provides personalised NDIS, aged care and private nursing support across the Sutherland Shire, Illawarra, Central Coast and Greater Sydney.

Our approach is simple: blend into your lifestyle while helping your unique strengths stand out. Whether you need personal care, community access, complex nursing, or clinical assessments — we adapt with you.

## Why person-centred care matters

Every participant has different goals, routines, and support needs. We build individualised care plans that evolve as your life does — with compassion, professionalism, and reliability 24/7.

## Ready to get started?

Contact our team for a conversation about how we can support you or your loved one.`,
    coverImage: "/images/about-hero.jpg",
    author: "Chameleon Care Group",
    published: true,
    publishedAt: "2026-01-15T00:00:00.000Z",
    tags: ["NDIS", "Care", "Welcome"],
  },
  {
    id: "ndis-continence",
    slug: "understanding-ndis-continence-assessments",
    title: "Understanding NDIS Continence Assessments",
    excerpt:
      "What to expect from a thorough continence assessment and how it supports your plan.",
    content: `A quality continence assessment helps NDIS participants access the right products, funding, and support for dignity and independence.

## What we cover

- Current needs and functional capacity
- Product and aid recommendations
- Individualised management plans
- Documentation for planners and support coordinators

Our clinical team delivers assessments that are clear, respectful, and planner-ready.`,
    coverImage: "/images/nurse-clinical.jpg",
    author: "Chameleon Care Group",
    published: true,
    publishedAt: "2026-02-01T00:00:00.000Z",
    tags: ["NDIS", "Continence", "Clinical"],
  },
];

export const DEFAULT_OFFERS = [
  {
    id: "new-participant",
    title: "New Participant Welcome",
    description:
      "Starting with a new provider can feel overwhelming. Book a free meet-and-greet so we can learn about your goals and show you how CCG adapts to you.",
    badge: "Free consultation",
    ctaLabel: "Book meet & greet",
    ctaHref: "/book-with-us",
    published: true,
    startsAt: "2026-01-01",
    endsAt: "2026-12-31",
  },
];

export const FAQ_ITEMS = [
  {
    q: "Why choose Chameleon Care Group?",
    a: "We provide personalised, compassionate care tailored to your unique needs. Individualised care plans adapt as your requirements change — so support stays relevant, reliable, and person-centred.",
  },
  {
    q: "Can I switch from my current provider to Chameleon Care Group?",
    a: "Absolutely. We're here to make the transition smooth and hassle-free. Contact our team and we'll guide you through every step.",
  },
  {
    q: "Do you offer services outside of the Sutherland Shire?",
    a: "Yes. We support participants across Illawarra, Central Coast, and Greater Sydney — as well as Sutherland Shire.",
  },
  {
    q: "Do you offer home visits?",
    a: "Yes. All our services are delivered in the comfort of your own home, tailored to your convenience. Contact us to arrange a meet-and-greet.",
  },
  {
    q: "What services does Chameleon Care Group offer?",
    a: "In-home nursing, disability and NDIS support, aged care, palliative care, personal care, community access, respite, overnight care, medication management, behavioural support, paediatric disability care, continence assessments, and clinical reporting.",
  },
  {
    q: "Which suburbs do you cover near Cronulla and Miranda?",
    a: "We cover the full Sutherland Shire including Cronulla, Miranda, Caringbah, Gymea, Engadine, Menai, Sylvania and surrounding suburbs — plus Illawarra, Central Coast and selected Greater Sydney areas.",
  },
  {
    q: "How do I book an NDIS assessment or support?",
    a: "Use our online Book With Us multi-step form, call 0430 068 300, or email chameleonnursingcare@gmail.com. We'll guide you through next steps.",
  },
  {
    q: "How can I leave a Google review?",
    a: "We would love your feedback. Leave a review on our Google Business Profile: https://g.page/r/CfVeH5GtaSdMEAI/review",
  },
];

export const WORKFORCE_POINTS = [
  {
    title: "Contract Nursing Services",
    body: "Flexible contract nurses for private hospitals, aged care facilities, and home care — from post-surgical care to palliative support.",
  },
  {
    title: "Customisable Workforce Solutions",
    body: "We partner with private healthcare providers to scale staffing with demand, ensuring continuity of care without compromise.",
  },
  {
    title: "Professional Standards",
    body: "All CCG nurses maintain AHPRA registration, up-to-date training and professional insurance for the highest standards of care.",
  },
];
