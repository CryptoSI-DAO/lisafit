"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/today");
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-center bg-[#0a0a0a] px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo size={36} />
          <h1 className="mt-6 text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-[#888]">Sign in to continue training</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#888]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3 text-sm text-white outline-none transition focus:border-[#e7f900]/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#888]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3 text-sm text-white outline-none transition focus:border-[#e7f900]/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[#f85149]/10 px-4 py-2 text-xs text-[#f85149]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#e7f900] py-3.5 font-bold text-black transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#888]">
          No account?{" "}
          <Link href="/auth/signup" className="font-medium text-[#e7f900]">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
