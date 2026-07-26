"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { Logo } from "@/components/logo";
import { InstallButton } from "@/components/install-button";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Logo size={32} />
      </main>
    );
  }

  if (!user) {
    router.push("/auth/signin");
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Logo size={32} />
      </main>
    );
  }

  const displayName = user.user_metadata?.display_name || "Athlete";
  const initial = (user.user_metadata?.display_name || user.email?.[0] || "U")
    .toUpperCase()
    .charAt(0);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-12 pb-24">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* User card */}
        <div className="mt-6 rounded-2xl border border-[#2a2a2a] bg-[#161616] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f900] text-2xl font-bold text-black">
              {initial}
            </div>
            <div>
              <p className="text-lg font-bold">{displayName}</p>
              <p className="text-xs text-[#888]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="mt-6 space-y-3">
          <InfoRow label="App" value="LisaFit v1.0" />
          <InfoRow label="Powered by" value="Lisa Kim AI" />
          <InfoRow label="Backend" value="Supabase" />
        </div>

        {/* Future features */}
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888]">
            Coming Soon
          </h2>
          <div className="space-y-2">
            <FutureRow icon="🏃" label="Outdoor workouts" />
            <FutureRow icon="🏋️" label="Gym exercises" />
            <FutureRow icon="👥" label="Friends & leaderboards" />
            <FutureRow icon="📊" label="Detailed analytics" />
          </div>
        </div>

        {/* Install as PWA */}
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888]">
            Install App
          </h2>
          <InstallButton />
        </div>

        {/* Sign out */}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3">
      <span className="text-xs text-[#888]">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

function FutureRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#2a2a2a] px-4 py-3">
      <span className="text-lg opacity-50">{icon}</span>
      <span className="text-sm text-[#555]">{label}</span>
    </div>
  );
}
