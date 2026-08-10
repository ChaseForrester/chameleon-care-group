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

export async function getBlogs({ publishedOnly = true } = {}) {
  const items = await listCollection("blogs", {
    publishedOnly,
    orderField: "publishedAt",
  });
  if (items && items.length) return items;
  return publishedOnly
    ? DEFAULT_BLOGS.filter((b) => b.published)
    : DEFAULT_BLOGS;
}

export async function getBlogBySlug(slug) {
  try {
    const snap = await getDocs(collection(db(), "blogs"));
    const found = snap.docs
      .map((d) => toPlain(d))
      .find((b) => b.slug === slug || b.id === slug);
    if (found) return found;
  } catch {
    /* fall through */
  }
  return DEFAULT_BLOGS.find((b) => b.slug === slug || b.id === slug) || null;
}

export async function getStories({ publishedOnly = true } = {}) {
  const items = await listCollection("stories", {
    publishedOnly,
    orderField: "createdAt",
  });
  if (items && items.length) return items;
  return publishedOnly
    ? DEFAULT_STORIES.filter((s) => s.published)
    : DEFAULT_STORIES;
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
    updatedAt: serverTimestamp(),
  };
  if (payload.published && !payload.publishedAt) {
    payload.publishedAt = serverTimestamp();
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

export async function saveStory(id, data) {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(doc(db(), "stories", id), payload, { merge: true });
    return id;
  }
  payload.createdAt = serverTimestamp();
  const refDoc = await addDoc(collection(db(), "stories"), payload);
  return refDoc.id;
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
export async function importDefaultStories() {
  let count = 0;
  for (const s of DEFAULT_STORIES) {
    const { id, ...rest } = s;
    const refDoc = doc(db(), "stories", id);
    const existing = await getDoc(refDoc);
    await setDoc(
      refDoc,
      {
        ...rest,
        published: true,
        consent: true,
        updatedAt: serverTimestamp(),
        ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true }
    );
    count++;
  }
  return count;
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
