"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const currentUserId = user.id;
    if (syncedRef.current === currentUserId) return;

    syncedRef.current = currentUserId;

    // Sync user with PostgreSQL in the background
    fetch("/api/auth/sync", {
      method: "POST",
    }).catch((err) => console.warn("Background user sync failed:", err));
  }, [isLoaded, isSignedIn, user]);

  return null;
}
