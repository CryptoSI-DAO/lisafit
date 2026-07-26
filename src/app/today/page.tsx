"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Logo } from "@/components/logo";

export default function TodayPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Logo size={32} />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-12 pb-24">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#888]">Welcome back,</p>
            <h1 className="text-2xl font-bold text-[#e7f900]">
              {user.user_metadata?.display_name || user.email?.split("@")[0]}
            </h1>
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888] transition hover:border-[#f85149]/50 hover:text-[#f85149]"
          >
            Sign out
          </button>
        </div>

        {/* Today's workout placeholder */}
        <div className="mt-8 rounded-2xl border border-[#2a2a2a] bg-[#161616] p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-[#888]">
            Today&apos;s Workout
          </p>
          <p className="mt-2 text-lg font-semibold">
            Stage 3 coming — exercise engine loading...
          </p>
          <p className="mt-1 text-sm text-[#888]">
            Auth is working ✅ — your daily workout will appear here.
          </p>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
