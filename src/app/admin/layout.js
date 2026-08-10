"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function AdminLayout({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}
