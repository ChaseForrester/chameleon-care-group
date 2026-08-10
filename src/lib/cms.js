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
import { db, storage } from "./firebase";
import {
  DEFAULT_BLOGS,
  DEFAULT_OFFERS,
  DEFAULT_SERVICES,
  DEFAULT_STORIES,
} from "./seedData";

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
        collection(db, name),
        where("published", "==", true),
        orderBy(orderField, "desc")
      );
    } else if (publishedOnly) {
      q = query(collection(db, name), where("published", "==", true));
    } else if (orderField) {
      q = query(collection(db, name), orderBy(orderField, "desc"));
    } else {
      q = collection(db, name);
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
    const snap = await getDocs(collection(db, "blogs"));
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
    const snap = await getDoc(doc(db, "pages", pageId));
    return toPlain(snap);
  } catch {
    return null;
  }
}

export async function getSettings() {
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
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
  if (!payload.publishedAt && payload.published) {
    payload.publishedAt = serverTimestamp();
  }
  if (id) {
    await updateDoc(doc(db, "blogs", id), payload);
    return id;
  }
  payload.createdAt = serverTimestamp();
  if (!payload.publishedAt && payload.published) {
    payload.publishedAt = serverTimestamp();
  }
  const refDoc = await addDoc(collection(db, "blogs"), payload);
  return refDoc.id;
}

export async function deleteBlog(id) {
  await deleteDoc(doc(db, "blogs", id));
}

export async function saveOffer(id, data) {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await updateDoc(doc(db, "offers", id), payload);
    return id;
  }
  payload.createdAt = serverTimestamp();
  const refDoc = await addDoc(collection(db, "offers"), payload);
  return refDoc.id;
}

export async function deleteOffer(id) {
  await deleteDoc(doc(db, "offers", id));
}

export async function saveStory(id, data) {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await updateDoc(doc(db, "stories", id), payload);
    return id;
  }
  payload.createdAt = serverTimestamp();
  const refDoc = await addDoc(collection(db, "stories"), payload);
  return refDoc.id;
}

export async function deleteStory(id) {
  await deleteDoc(doc(db, "stories", id));
}

export async function saveService(id, data) {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(doc(db, "services", id), payload, { merge: true });
    return id;
  }
  payload.createdAt = serverTimestamp();
  const refDoc = await addDoc(collection(db, "services"), payload);
  return refDoc.id;
}

export async function deleteService(id) {
  await deleteDoc(doc(db, "services", id));
}

export async function savePage(pageId, data) {
  await setDoc(
    doc(db, "pages", pageId),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function saveSettings(data) {
  await setDoc(
    doc(db, "settings", "site"),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function submitInquiry(data) {
  await addDoc(collection(db, "inquiries"), {
    ...data,
    createdAt: serverTimestamp(),
    status: "new",
  });
}

export async function getInquiries() {
  try {
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => toPlain(d));
  } catch {
    return [];
  }
}

export async function uploadImage(file, folder = "uploads") {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function isUserAdmin(uid) {
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, "admins", uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function seedDefaultsIfEmpty() {
  const results = { blogs: 0, stories: 0, services: 0, offers: 0 };
  try {
    const blogsSnap = await getDocs(collection(db, "blogs"));
    if (blogsSnap.empty) {
      for (const b of DEFAULT_BLOGS) {
        const { id, ...rest } = b;
        await setDoc(doc(db, "blogs", id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.blogs++;
      }
    }
    const storiesSnap = await getDocs(collection(db, "stories"));
    if (storiesSnap.empty) {
      for (const s of DEFAULT_STORIES) {
        const { id, ...rest } = s;
        await setDoc(doc(db, "stories", id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.stories++;
      }
    }
    const servicesSnap = await getDocs(collection(db, "services"));
    if (servicesSnap.empty) {
      for (const s of DEFAULT_SERVICES) {
        const { id, ...rest } = s;
        await setDoc(doc(db, "services", id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.services++;
      }
    }
    const offersSnap = await getDocs(collection(db, "offers"));
    if (offersSnap.empty) {
      for (const o of DEFAULT_OFFERS) {
        const { id, ...rest } = o;
        await setDoc(doc(db, "offers", id), {
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
