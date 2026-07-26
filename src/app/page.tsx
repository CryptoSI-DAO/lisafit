import { Logo } from "@/components/logo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[#0a0a0a] px-6 py-12">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-2 animate-pulse">
          <Logo size={56} />
        </div>

        <h1 className="mt-12 text-4xl font-bold tracking-tight sm:text-5xl">
          TRAIN WITH <span className="text-[#e7f900] text-glow">LISA</span>
        </h1>

        <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#888]">
          Daily workouts generated for you. Score every session.
          Beat your personal best. No gym required.
        </p>

        {/* Day-type preview pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Pill color="#22c55e" label="Easy" />
          <Pill color="#e7f900" label="Normal" />
          <Pill color="#f85149" label="Tough" />
          <Pill color="#6366f1" label="Rest" />
        </div>

        {/* Sample exercise preview */}
        <div className="mt-10 w-full max-w-sm space-y-2">
          <ExercisePreview name="Push-ups" target="30 reps" />
          <ExercisePreview name="Squats" target="40 reps" />
          <ExercisePreview name="Plank" target="45s hold" />
        </div>
      </div>

      {/* CTAs */}
      <div className="w-full max-w-sm space-y-3 pt-8">
        <Link
          href="/auth/signin"
          className="block w-full rounded-xl bg-[#e7f900] py-4 text-center font-bold text-black transition active:scale-[0.98]"
        >
          START TRAINING
        </Link>
        <Link
          href="/auth/signup"
          className="block w-full rounded-xl border border-[#2a2a2a] py-4 text-center font-medium text-white transition active:scale-[0.98] hover:border-[#e7f900]/50"
        >
          Create account
        </Link>
      </div>
    </main>
  );
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider"
      style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}33` }}
    >
      {label}
    </span>
  );
}

function ExercisePreview({ name, target }: { name: string; target: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3">
      <span className="text-sm font-medium">{name}</span>
      <span className="font-mono text-xs text-[#888]">{target}</span>
    </div>
  );
}
