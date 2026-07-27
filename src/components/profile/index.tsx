/**
 * User profile card with avatar, name, and email.
 */
export function UserCard({
  displayName,
  email,
}: {
  displayName: string;
  email: string | undefined;
}) {
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#161616] p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f900] text-2xl font-bold text-black">
          {initial}
        </div>
        <div>
          <p className="text-lg font-bold">{displayName}</p>
          <p className="text-xs text-[#888]">{email}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple label-value info row.
 */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3">
      <span className="text-xs text-[#888]">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

/**
 * Placeholder for upcoming features.
 */
export function FutureFeature({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#2a2a2a] px-4 py-3">
      <span className="text-lg opacity-50">{icon}</span>
      <span className="text-sm text-[#555]">{label}</span>
    </div>
  );
}

/**
 * Coming soon features list.
 */
export function ComingSoonFeatures() {
  return (
    <>
      <FutureFeature icon="🏃" label="Outdoor workouts" />
      <FutureFeature icon="🏋️" label="Gym exercises" />
      <FutureFeature icon="👥" label="Friends & leaderboards" />
      <FutureFeature icon="📊" label="Detailed analytics" />
    </>
  );
}
