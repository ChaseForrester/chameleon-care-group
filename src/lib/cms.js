import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getClientDb, getClientStorage } from "./firebase";
import {
  DEFAULT_BLOGS,
  DEFAULT_OFFERS,
  DEFAULT_SERVICES,
  DEFAULT_STORIES,
} from "./seedData";
import { LEGAL_PDFS } from "./legalDocs";

function db() {
  return getClientDb();
}
function storage() {
  return getClientStorage();
}

function toPlain(docSnap) {
  if (!docSnap?.exists?.()) return null;
  const data = docSnap.data();
  const out = { id: docSnap.id, ...data };
  // Serialize timestamps for client components
  Object.keys(out).forEach((k) => {
    if (out[k] instanceof Timestamp) {
      out[k] = out[k].toDate().toISOString();
    }
  });
  return out;
}

async function listCollection(name, { publishedOnly = false, orderField } = {}) {
  try {
    let q;
    if (publishedOnly && orderField) {
      q = query(
        collection(db(), name),
        where("published", "==", true),
        orderBy(orderField, "desc")
      );
    } else if (publishedOnly) {
      q = query(collection(db(), name), where("published", "==", true));
    } else if (orderField) {
      q = query(collection(db(), name), orderBy(orderField, "desc"));
    } else {
      q = collection(db(), name);
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => toPlain(d));
  } catch (err) {
    console.warn(`[cms] list ${name} failed, using defaults`, err?.message || err);
    return null;
  }
}

/**
 * Load blogs for public site + admin.
 * Avoids composite where+orderBy queries (they fail without indexes and
 * silently fell back to seed posts — hiding CMS-created blogs).
 */
export async function getBlogs({ publishedOnly = true } = {}) {
  // Prefer a plain collection read; rules filter unpublished for public users.
  let items = await listCollection("blogs", { publishedOnly: false });
  if (items === null) {
    items = await listCollection("blogs", { publishedOnly: true });
  }

  const fromCms = Array.isArray(items) ? items : [];
  // Merge seed posts that are not already in Firestore (by slug)
  const slugs = new Set(
    fromCms.map((b) => (b.slug || b.id || "").toLowerCase()).filter(Boolean)
  );
  const seedExtras = DEFAULT_BLOGS.filter((b) => {
    const key = (b.slug || b.id || "").toLowerCase();
    return key && !slugs.has(key);
  });

  let list = [...fromCms, ...seedExtras];

  if (publishedOnly) {
    list = list.filter((b) => b.published !== false && b.published !== "false");
  }

  list.sort((a, b) => {
    const ta = Date.parse(a.publishedAt || a.createdAt || "") || 0;
    const tb = Date.parse(b.publishedAt || b.createdAt || "") || 0;
    return tb - ta;
  });

  // If Firestore is empty/offline, seed only
  if (!list.length) {
    return publishedOnly
      ? DEFAULT_BLOGS.filter((b) => b.published)
      : [...DEFAULT_BLOGS];
  }

  return list;
}

export async function getBlogBySlug(slug) {
  if (!slug) return null;
  const key = String(slug).toLowerCase();
  try {
    // Plain list — no composite index required
    const items = await listCollection("blogs", { publishedOnly: false });
    if (items?.length) {
      const found = items.find(
        (b) =>
          (b.slug || "").toLowerCase() === key ||
          (b.id || "").toLowerCase() === key
      );
      if (found) return found;
    }
  } catch {
    /* fall through */
  }
  return (
    DEFAULT_BLOGS.find(
      (b) =>
        (b.slug || "").toLowerCase() === key ||
        (b.id || "").toLowerCase() === key
    ) || null
  );
}

/**
 * Strip fancy punctuation that breaks admin inputs / looks like a stray dash.
 * Handles en-dash, em-dash, minus, soft hyphen, fullwidth hyphen, etc.
 */
export function cleanStoryText(value) {
  if (value == null) return "";
  return (
    String(value)
      // all common dash / hyphen code points → plain hyphen
      .replace(/[\u002D\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D\u00AD]+/g, "-")
      // curly quotes → straight
      .replace(/[\u2018\u2019\u02BC]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      // non-breaking / narrow spaces
      .replace(/[\u00A0\u202F\u2007\u2009\u200A\u200B\uFEFF]/g, " ")
      // collapse whitespace (including newlines that create huge quote gaps)
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Normalize story fields for admin + public display.
 * Name and location stay separate — never "Ryan - Central Coast".
 */
export function normalizeStoryFields(data = {}) {
  let name = cleanStoryText(data.name);
  let location = cleanStoryText(data.location);
  let quote = cleanStoryText(data.quote);

  // If name accidentally contains the location (e.g. "Ryan Central Coast - Gosford")
  if (name && /central\s*coast/i.test(name)) {
    const parts = name.split(/\s*-\s*|\s*,\s*/);
    if (parts.length >= 2) {
      name = parts[0].trim();
      if (!location) location = parts.slice(1).join(", ").trim();
    }
  }

  // Location should never start with the person name
  if (location && name && location.toLowerCase().startsWith(name.toLowerCase())) {
    location = location.slice(name.length).replace(/^[\s,\-]+/, "").trim();
  }

  // Known broken import from Webflow: "Central Coast - Gosford" / en-dash variants
  if (/central\s*coast/i.test(location) && /gosford/i.test(location)) {
    location = "Gosford";
  } else {
    // "Region - Suburb" → just keep a clean comma form, no hyphens
    location = location
      .replace(/\s*-\s*/g, ", ")
      .replace(/,\s*,+/g, ",")
      .replace(/^,\s*|\s*,$/g, "")
      .trim();
  }

  // Prefer seed quote if stored quote looks corrupted (replacement chars, etc.)
  if (/[�\uFFFD]/.test(quote) || /\?>|<\?/.test(quote)) {
    const seed = DEFAULT_STORIES.find((s) => s.id === data.id);
    if (seed?.quote) quote = cleanStoryText(seed.quote);
  }

  return {
    ...data,
    name,
    location,
    quote,
    published: data.published !== false && data.published !== "false",
    consent: data.consent !== false && data.consent !== "false",
  };
}

/**
 * Single source of truth for success stories (public site + admin).
 * Always normalises text and removes name+quote doubles so both UIs match.
 */
export async function getStories({ publishedOnly = true } = {}) {
  // Fetch without orderBy — missing createdAt / indexes must not break the list.
  // For public users, Firestore rules only return published docs anyway.
  // Prefer unfiltered read so admin sees drafts; fall back to published query.
  let items = await listCollection("stories", { publishedOnly: false });
  if (items === null) {
    items = await listCollection("stories", { publishedOnly: true });
  }

  if (items && items.length) {
    let list = items.map((s) => normalizeStoryFields(s));
    list = dedupeStoriesList(list);

    if (publishedOnly) {
      list = list.filter(
        (s) => s.published !== false && s.consent !== false
      );
    }

    return list;
  }

  // Firestore empty / offline — seed defaults (already unique)
  const fallback = dedupeStoriesList(
    DEFAULT_STORIES.map((s) => normalizeStoryFields(s))
  );
  if (publishedOnly) {
    return fallback.filter((s) => s.published !== false && s.consent !== false);
  }
  return fallback;
}

export async function getOffers({ publishedOnly = true } = {}) {
  const items = await listCollection("offers", {
    publishedOnly,
    orderField: "createdAt",
  });
  if (items && items.length) return items;
  return publishedOnly
    ? DEFAULT_OFFERS.filter((o) => o.published)
    : DEFAULT_OFFERS;
}

export async function getServices({ publishedOnly = true } = {}) {
  const items = await listCollection("services", { publishedOnly });
  if (items && items.length) {
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  return DEFAULT_SERVICES.filter((s) => (publishedOnly ? s.published : true));
}

export async function getPageContent(pageId) {
  try {
    const snap = await getDoc(doc(db(), "pages", pageId));
    return toPlain(snap);
  } catch {
    return null;
  }
}

export async function getSettings() {
  try {
    const snap = await getDoc(doc(db(), "settings", "site"));
    return toPlain(snap);
  } catch {
    return null;
  }
}

/* ── Admin CRUD ── */

export async function saveBlog(id, data) {
  const payload = {
    ...data,
    title: (data.title || "").trim(),
    slug: (data.slug || "").trim(),
    excerpt: data.excerpt || "",
    content: data.content || "",
    coverImage: data.coverImage || "",
    author: data.author || "Chameleon Care Group",
    tags: Array.isArray(data.tags) ? data.tags : [],
    // Always store a real boolean so public queries / filters work
    published: data.published === true || data.published === "true",
    updatedAt: serverTimestamp(),
  };

  if (payload.published) {
    // New publishes always get a timestamp; keep existing on edit via merge
    if (!id || !data.publishedAt) {
      payload.publishedAt = serverTimestamp();
    }
  }

  if (id) {
    // merge so partial updates never wipe existing fields accidentally
    await setDoc(doc(db(), "blogs", id), payload, { merge: true });
    return id;
  }
  payload.createdAt = serverTimestamp();
  if (payload.published && !payload.publishedAt) {
    payload.publishedAt = serverTimestamp();
  }
  const refDoc = await addDoc(collection(db(), "blogs"), payload);
  return refDoc.id;
}

export async function deleteBlog(id) {
  await deleteDoc(doc(db(), "blogs", id));
}

export async function saveOffer(id, data) {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await updateDoc(doc(db(), "offers", id), payload);
    return id;
  }
  payload.createdAt = serverTimestamp();
  const refDoc = await addDoc(collection(db(), "offers"), payload);
  return refDoc.id;
}

export async function deleteOffer(id) {
  await deleteDoc(doc(db(), "offers", id));
}

/**
 * Find an existing story that matches name + quote (case-insensitive).
 * Used to prevent duplicate success stories.
 */
export async function findDuplicateStory({ name, quote, excludeId } = {}) {
  const nName = cleanStoryText(name).toLowerCase();
  const nQuote = cleanStoryText(quote).toLowerCase().slice(0, 120);
  if (!nName || !nQuote) return null;

  const all = await getStories({ publishedOnly: false });
  return (
    all.find((s) => {
      if (excludeId && s.id === excludeId) return false;
      const sName = cleanStoryText(s.name).toLowerCase();
      const sQuote = cleanStoryText(s.quote).toLowerCase().slice(0, 120);
      return sName === nName && sQuote === nQuote;
    }) || null
  );
}

/**
 * @param {string|null} id
 * @param {object} data
 * @param {{ email?: string, uid?: string }} [actor] Admin who is saving
 */
export async function saveStory(id, data, actor = {}) {
  const normalized = normalizeStoryFields(data);
  if (!normalized.name || !normalized.quote) {
    throw new Error("Name and quote are required.");
  }

  const dup = await findDuplicateStory({
    name: normalized.name,
    quote: normalized.quote,
    excludeId: id || undefined,
  });
  if (dup) {
    throw new Error(
      `A story for “${dup.name}” with the same quote already exists. Edit the existing one instead of adding a double.`
    );
  }

  const email = (actor.email || "").trim() || null;
  const uid = actor.uid || null;
  const nowIso = new Date().toISOString();

  const payload = {
    name: normalized.name,
    location: normalized.location,
    quote: normalized.quote,
    published: !!normalized.published,
    consent: !!normalized.consent,
    updatedAt: serverTimestamp(),
    updatedAtIso: nowIso,
  };

  if (email) {
    payload.updatedByEmail = email;
    payload.updatedByUid = uid;
  }

  if (id) {
    await setDoc(doc(db(), "stories", id), payload, { merge: true });
    return id;
  }

  payload.createdAt = serverTimestamp();
  payload.createdAtIso = nowIso;
  if (email) {
    payload.createdByEmail = email;
    payload.createdByUid = uid;
  }
  const refDoc = await addDoc(collection(db(), "stories"), payload);
  return refDoc.id;
}

function storyDedupeKey(item = {}) {
  const name = cleanStoryText(item.name).toLowerCase();
  const quote = cleanStoryText(item.quote).toLowerCase().slice(0, 160);
  // Prefer stable seed ids when present so erica/kim/kelly/ryan win over random copies
  return `${name}|${quote}`;
}

/**
 * Deduplicate stories in memory (same name + quote).
 * Keeps the best doc: fixed seed id (erica/kim/…) first, else oldest created.
 */
export function dedupeStoriesList(items = []) {
  const seedIds = new Set(DEFAULT_STORIES.map((s) => s.id));
  const byKey = new Map();

  const score = (item) => {
    // Higher is better to keep
    let s = 0;
    if (seedIds.has(item.id)) s += 1000;
    if (item.source === "webflow") s += 100;
    if (item.createdByEmail) s += 10;
    // Prefer older originals over later accidental re-adds
    const t = Date.parse(item.createdAt || item.createdAtIso || "") || 0;
    s += Math.max(0, 2_000_000_000_000 - t) / 1e15;
    return s;
  };

  for (const item of items) {
    if (!item) continue;
    const key = storyDedupeKey(item);
    if (!key || key === "|") continue;
    const prev = byKey.get(key);
    if (!prev || score(item) > score(prev)) {
      byKey.set(key, item);
    }
  }

  const out = Array.from(byKey.values());
  // Stable display order: seed order first, then newest extras
  const seedOrder = DEFAULT_STORIES.map((s) => s.id);
  out.sort((a, b) => {
    const ia = seedOrder.indexOf(a.id);
    const ib = seedOrder.indexOf(b.id);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    const ta = a.createdAt || a.createdAtIso || "";
    const tb = b.createdAt || b.createdAtIso || "";
    return String(tb).localeCompare(String(ta));
  });
  return out;
}

/**
 * Delete true duplicate docs from Firestore (keeps the winner from dedupeStoriesList).
 * @returns {Promise<number>} number of docs removed
 */
export async function purgeDuplicateStories() {
  // Read raw (no dedupe) so we can find extras
  const raw = await listCollection("stories", { publishedOnly: false });
  if (!raw || !raw.length) return 0;

  const normalized = raw.map((s) => normalizeStoryFields(s));
  const winners = dedupeStoriesList(normalized);
  const keep = new Set(winners.map((w) => w.id).filter(Boolean));
  let removed = 0;
  for (const item of normalized) {
    if (!item.id || keep.has(item.id)) continue;
    // Only purge if it's a true content double of a kept story
    const key = storyDedupeKey(item);
    const hasWinner = winners.some((w) => storyDedupeKey(w) === key);
    if (!hasWinner) continue;
    await deleteDoc(doc(db(), "stories", item.id));
    removed++;
  }
  return removed;
}

export async function deleteStory(id) {
  await deleteDoc(doc(db(), "stories", id));
}

export async function saveService(id, data) {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(doc(db(), "services", id), payload, { merge: true });
    return id;
  }
  payload.createdAt = serverTimestamp();
  const refDoc = await addDoc(collection(db(), "services"), payload);
  return refDoc.id;
}

export async function deleteService(id) {
  await deleteDoc(doc(db(), "services", id));
}

export async function savePage(pageId, data) {
  await setDoc(
    doc(db(), "pages", pageId),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function saveSettings(data) {
  await setDoc(
    doc(db(), "settings", "site"),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Flatten inquiry data for Firestore + email (no functions / files).
 * Keeps the payload JSON-serialisable for the notify API.
 */
function plainInquiry(data = {}) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (typeof value === "function") continue;
    if (typeof File !== "undefined" && value instanceof File) continue;
    if (typeof Blob !== "undefined" && value instanceof Blob) continue;
    // Avoid duplicating the entire wizard as a JSON string blob in email
    if (key === "message" && data.source === "book-wizard" && typeof value === "string" && value.startsWith("{")) {
      continue;
    }
    // Keep only serialisable document metadata
    if (key === "documents") {
      out.documents = Array.isArray(value)
        ? value
          .filter((d) => d && typeof d === "object" && d.url)
          .map((d) => ({
            name: d.name || "Document",
            url: d.url,
            size: d.size || 0,
            contentType: d.contentType || "",
            path: d.path || "",
          }))
        : [];
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * Save enquiry to Firestore and email the care team.
 * Succeeds if either channel works so submissions are not lost.
 * @returns {{ firestoreOk: boolean, emailOk: boolean, emailProvider?: string }}
 */
export async function submitInquiry(data) {
  const payload = plainInquiry(data);
  let firestoreOk = false;
  let emailOk = false;
  let emailProvider;
  let emailError;
  let firestoreError;

  try {
    await addDoc(collection(db(), "inquiries"), {
      ...payload,
      createdAt: serverTimestamp(),
      status: "new",
    });
    firestoreOk = true;
  } catch (err) {
    firestoreError = err?.message || String(err);
    console.warn("[submitInquiry] Firestore save failed:", err);
  }

  try {
    const res = await fetch("/api/notify-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.ok) {
      emailOk = true;
      emailProvider = body.provider;
    } else {
      emailError = body.error || `Email HTTP ${res.status}`;
      console.warn("[submitInquiry] Email notify failed:", emailError);
    }
  } catch (err) {
    emailError = err?.message || String(err);
    console.warn("[submitInquiry] Email notify error:", err);
  }

  if (!firestoreOk && !emailOk) {
    const err = new Error(
      emailError || firestoreError || "Unable to submit your enquiry. Please try again or call 0430 068 300."
    );
    err.emailError = emailError;
    err.firestoreError = firestoreError;
    throw err;
  }

  return { firestoreOk, emailOk, emailProvider };
}

export async function getInquiries() {
  try {
    const q = query(collection(db(), "inquiries"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => toPlain(d));
  } catch (err) {
    // Fallback without orderBy if index is missing
    try {
      const snap = await getDocs(collection(db(), "inquiries"));
      const items = snap.docs.map((d) => toPlain(d));
      return items.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    } catch (err2) {
      console.warn("[cms] getInquiries failed:", err2?.message || err?.message || err);
      throw err2 || err;
    }
  }
}

export async function uploadImage(file, folder = "uploads") {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage(), path);
  await uploadBytes(storageRef, file, {
    contentType: file.type || "image/jpeg",
  });
  return getDownloadURL(storageRef);
}

/**
 * Upload any allowed file (PDF, Word, image, text) to Storage.
 * @returns {{ url: string, path: string, name: string, contentType: string, size: number }}
 */
export async function uploadFile(file, folder = "uploads") {
  if (!file) throw new Error("No file selected");
  const safeName = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage(), path);
  const contentType = file.type || "application/octet-stream";
  await uploadBytes(storageRef, file, { contentType });
  const url = await getDownloadURL(storageRef);
  return {
    url,
    path,
    name: file.name || safeName,
    contentType,
    size: file.size || 0,
  };
}

export async function deleteStoragePath(path) {
  // Only delete Storage object keys — not public /pdfs/ paths or full HTTPS URLs
  if (!path || path.startsWith("/pdfs/") || /^https?:\/\//i.test(path)) return;
  try {
    await deleteObject(ref(storage(), path));
  } catch (err) {
    console.warn("[cms] deleteStoragePath", err?.message || err);
  }
}

/* ── Legal / laws documents ── */

export async function getLegalDocs({ includeUnpublished = false } = {}) {
  let cms = [];
  try {
    const snap = await getDocs(collection(db(), "legalDocs"));
    cms = snap.docs.map((d) => toPlain(d));
  } catch (err) {
    console.warn("[cms] getLegalDocs", err?.message || err);
  }

  const byId = new Map();
  for (const seed of LEGAL_PDFS) {
    byId.set(seed.id, {
      ...seed,
      source: "seed",
      published: true,
      order: seed.order ?? 100,
    });
  }
  for (const docItem of cms) {
    const id = docItem.id || docItem.builtInId;
    if (!id) continue;
    byId.set(id, {
      ...byId.get(id),
      ...docItem,
      id,
      source: docItem.source || "cms",
    });
  }

  let list = Array.from(byId.values());
  if (!includeUnpublished) {
    list = list.filter((d) => d.published !== false);
  }
  return list.sort((a, b) => {
    const oa = Number(a.order) || 999;
    const ob = Number(b.order) || 999;
    if (oa !== ob) return oa - ob;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

export async function saveLegalDoc(id, data) {
  const payload = {
    title: (data.title || "").trim(),
    description: data.description || "",
    category: data.category || "Documents",
    file: data.file || "",
    storagePath: data.storagePath || "",
    externalUrl: data.externalUrl || "",
    externalLabel: data.externalLabel || "",
    order: Number(data.order) || 100,
    published: data.published !== false,
    updatedAt: serverTimestamp(),
  };
  if (!payload.title) throw new Error("Title is required");
  if (!payload.file) throw new Error("A PDF file or file URL is required");

  if (id) {
    await setDoc(doc(db(), "legalDocs", id), payload, { merge: true });
    return id;
  }
  payload.createdAt = serverTimestamp();
  payload.source = "cms";
  const refDoc = await addDoc(collection(db(), "legalDocs"), payload);
  return refDoc.id;
}

/**
 * Upsert a seed document override (same id as LEGAL_PDFS entry).
 */
export async function upsertLegalDocById(id, data) {
  if (!id) throw new Error("Document id required");
  const payload = {
    title: (data.title || "").trim(),
    description: data.description || "",
    category: data.category || "Documents",
    file: data.file || "",
    storagePath: data.storagePath || "",
    externalUrl: data.externalUrl || "",
    externalLabel: data.externalLabel || "",
    order: Number(data.order) || 100,
    published: data.published !== false,
    source: data.source || "cms",
    builtInId: id,
    updatedAt: serverTimestamp(),
  };
  const existing = await getDoc(doc(db(), "legalDocs", id));
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(doc(db(), "legalDocs", id), payload, { merge: true });
  return id;
}

export async function deleteLegalDoc(id, { storagePath } = {}) {
  if (!id) throw new Error("Missing document id");
  // Never delete seed file paths under /pdfs/ — only Firestore override + Storage uploads
  try {
    const snap = await getDoc(doc(db(), "legalDocs", id));
    const path = storagePath || snap.data()?.storagePath;
    if (path && !String(path).startsWith("/pdfs/")) {
      try {
        await deleteObject(ref(storage(), path));
      } catch {
        /* ignore missing storage object */
      }
    }
  } catch {
    /* continue to delete firestore doc */
  }
  await deleteDoc(doc(db(), "legalDocs", id));
}

const DOC_MAX_BYTES = 10 * 1024 * 1024;
const DOC_ACCEPT_RE =
  /^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|text\/plain|application\/octet-stream)/i;
const DOC_EXT_RE = /\.(pdf|png|jpe?g|gif|webp|doc|docx|txt)$/i;

/**
 * Upload a supporting document for a public form submission.
 * Stored under inquiry-docs/ (public create + read via storage rules).
 * @returns {{ name: string, url: string, size: number, contentType: string, path: string }}
 */
export async function uploadInquiryDocument(file) {
  if (!file) throw new Error("No file selected");
  if (file.size > DOC_MAX_BYTES) {
    throw new Error(`“${file.name}” is too large (max 10MB).`);
  }
  if (!DOC_ACCEPT_RE.test(file.type || "") && !DOC_EXT_RE.test(file.name || "")) {
    throw new Error(
      `“${file.name}” is not a supported type. Use PDF, Word, image or text.`
    );
  }

  const safeName = (file.name || "document").replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `inquiry-docs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const storageRef = ref(storage(), path);
  const contentType = file.type || "application/octet-stream";
  await uploadBytes(storageRef, file, { contentType });
  const url = await getDownloadURL(storageRef);
  return {
    name: file.name || safeName,
    url,
    size: file.size,
    contentType,
    path,
  };
}

export async function updateInquiry(id, data) {
  if (!id) throw new Error("Missing inquiry id");
  await updateDoc(doc(db(), "inquiries", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInquiry(id) {
  if (!id) throw new Error("Missing inquiry id");
  await deleteDoc(doc(db(), "inquiries", id));
}

export async function isUserAdmin(uid) {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db(), "admins", uid));
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * Upsert the original Webflow success stories into Firestore so they appear
 * in the admin panel and on the public Success Stories page.
 */
export async function importDefaultStories(actor = {}) {
  let count = 0;
  const email = (actor.email || "system@import").trim();
  const nowIso = new Date().toISOString();
  for (const s of DEFAULT_STORIES) {
    const normalized = normalizeStoryFields(s);
    const refDoc = doc(db(), "stories", normalized.id || s.id);
    const existing = await getDoc(refDoc);
    const prev = existing.exists() ? existing.data() : {};
    // Full field overwrite (not shallow merge of stale en-dash locations)
    await setDoc(refDoc, {
      name: normalized.name,
      location: normalized.location,
      quote: normalized.quote,
      source: "webflow",
      published: true,
      consent: true,
      updatedAt: serverTimestamp(),
      updatedAtIso: nowIso,
      updatedByEmail: email,
      createdAt: prev.createdAt || serverTimestamp(),
      createdAtIso: prev.createdAtIso || nowIso,
      createdByEmail: prev.createdByEmail || email,
    });
    count++;
  }
  return count;
}

/**
 * Repair fancy dashes and purge content doubles so public site matches admin.
 * @returns {Promise<{ fixed: number, removed: number }>}
 */
export async function repairStoriesFormatting() {
  const raw = (await listCollection("stories", { publishedOnly: false })) || [];
  let fixed = 0;
  for (const item of raw) {
    if (!item?.id) continue;
    const next = normalizeStoryFields(item);
    const changed =
      next.name !== (item.name || "") ||
      next.location !== (item.location || "") ||
      next.quote !== (item.quote || "");
    if (!changed) continue;
    await setDoc(
      doc(db(), "stories", item.id),
      {
        name: next.name,
        location: next.location,
        quote: next.quote,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    fixed++;
  }
  const removed = await purgeDuplicateStories();
  return { fixed, removed };
}

export async function seedDefaultsIfEmpty() {
  const results = { blogs: 0, stories: 0, services: 0, offers: 0 };
  try {
    const blogsSnap = await getDocs(collection(db(), "blogs"));
    if (blogsSnap.empty) {
      for (const b of DEFAULT_BLOGS) {
        const { id, ...rest } = b;
        await setDoc(doc(db(), "blogs", id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.blogs++;
      }
    }
    // Always ensure the original Webflow success stories exist (merge)
    results.stories = await importDefaultStories();
    const servicesSnap = await getDocs(collection(db(), "services"));
    if (servicesSnap.empty) {
      for (const s of DEFAULT_SERVICES) {
        const { id, ...rest } = s;
        await setDoc(doc(db(), "services", id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.services++;
      }
    }
    const offersSnap = await getDocs(collection(db(), "offers"));
    if (offersSnap.empty) {
      for (const o of DEFAULT_OFFERS) {
        const { id, ...rest } = o;
        await setDoc(doc(db(), "offers", id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.offers++;
      }
    }
  } catch (err) {
    console.error("seedDefaultsIfEmpty", err);
    throw err;
  }
  return results;
}
