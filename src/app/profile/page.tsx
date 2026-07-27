"use client";

import { useAuth } from "@/lib/auth-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { LoadingScreen } from "@/components/loading-screen";
import { InstallButton } from "@/components/install-button";
import { UserCard, InfoRow, ComingSoonFeatures } from "@/components/profile";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const authLoading = useRequireAuth();
  const router = useRouter();

  if (authLoading) return <LoadingScreen />;

  if (!user) {
    router.push("/auth/signin");
    return <LoadingScreen />;
  }

  const displayName = user.user_metadata?.display_name || "Athlete";

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-12 pb-24">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">Profile</h1>

        <div className="mt-6">
          <UserCard displayName={displayName} email={user.email} />
        </div>

        <div className="mt-6 space-y-3">
          <InfoRow label="App" value="LisaFit v1.0" />
          <InfoRow label="Powered by" value="Lisa Kim AI" />
          <InfoRow label="Backend" value="Supabase" />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888]">
            Coming Soon
          </h2>
          <div className="space-y-2">
            <ComingSoonFeatures />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888]">
            Install App
          </h2>
          <InstallButton />
        </div>

        <button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="mt-8 w-full rounded-xl border border-[#f85149]/30 py-3.5 text-sm font-medium text-[#f85149] transition active:scale-[0.98] hover:bg-[#f85149]/10"
        >
          Sign Out
        </button>
      </div>
      <BottomNav />
    </main>
  );
}
