import { Logo } from "./logo";

/**
 * Full-screen loading spinner with LisaFit branding.
 * Used during auth checks and data fetching.
 */
export function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#e7f900] border-t-transparent" />
        <p className="text-sm text-[#888]">Loading...</p>
      </div>
    </main>
  );
}

/**
 * Compact inline spinner for smaller loading contexts.
 */
export function InlineSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e7f900] border-t-transparent" />
      <span className="text-sm text-[#888]">{label}</span>
    </div>
  );
}
