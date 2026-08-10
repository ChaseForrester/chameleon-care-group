import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAwWFltmWZQYyi17SiAFdpZX3QuAm7whEI",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "chameleon-care-group-au.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "chameleon-care-group-au",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "chameleon-care-group-au.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "356707034868",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:356707034868:web:41f97eef13f62aef2e60a1",
};

let _app;
let _auth;
let _db;
let _storage;

function assertClient() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK is only available in the browser");
  }
}

function getFirebaseApp() {
  assertClient();
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

/** Browser-only Auth instance (lazy). */
export function getClientAuth() {
  assertClient();
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

/** Browser-only Firestore instance (lazy). */
export function getClientDb() {
  assertClient();
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

/** Browser-only Storage instance (lazy). */
export function getClientStorage() {
  assertClient();
  if (!_storage) _storage = getStorage(getFirebaseApp());
  return _storage;
}

/**
 * Back-compat getters — do NOT call getAuth/getFirestore at module top level.
 * Eager init breaks under Next/Turbopack ("Service firestore is not available")
 * when the Firebase packages are tree-shaken or split across chunks.
 */
export const auth = {
  get currentUser() {
    if (typeof window === "undefined") return null;
    try {
      return getClientAuth().currentUser;
    } catch {
      return null;
    }
  },
};

export function db() {
  return getClientDb();
}

export function storage() {
  return getClientStorage();
}

export default function getAppDefault() {
  return getFirebaseApp();
}
