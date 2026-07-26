import Link from "next/link";

export default function ComingSoon() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <h1 className="text-2xl font-bold text-[#e7f900]">Coming Soon</h1>
      <p className="mt-2 text-sm text-[#888]">This stage is still being built.</p>
      <Link
        href="/"
        className="mt-8 rounded-xl border border-[#2a2a2a] px-6 py-3 text-sm font-medium transition hover:border-[#e7f900]/50"
      >
        ← Back home
      </Link>
    </main>
  );
}
