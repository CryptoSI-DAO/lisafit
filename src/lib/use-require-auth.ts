"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

/**
 * Auth guard hook for protected pages.
 *
 * Redirects to /auth/signin if the user is not authenticated.
 * Returns `loading` so the caller can show a loading screen.
 *
 * @example
 * const loading = useRequireAuth();
 * if (loading) return <LoadingScreen />;
 *
 * // User is guaranteed non-null below this point
 */
export function useRequireAuth(): boolean {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  return loading;
}
