"use client";

import { useState, useEffect } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallButton({
  className = "",
  label = "Install App",
}: {
  className?: string;
  label?: string;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  // iOS Safari doesn't support beforeinstallprompt — show instructions instead
  const isIOS =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
    !(window as unknown as { MSStream?: boolean }).MSStream;

  if (installed) {
    return (
      <div
        className={`flex items-center justify-center gap-2 rounded-xl border border-[#22c55e]/30 py-3.5 text-sm font-medium text-[#22c55e] ${className}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Installed
      </div>
    );
  }

  if (isIOS && !deferredPrompt) {
    return (
      <div className={`rounded-xl border border-[#2a2a2a] bg-[#161616] p-4 ${className}`}>
        <p className="text-sm font-medium">Install on iPhone</p>
        <p className="mt-1.5 text-xs leading-relaxed text-[#888]">
          Tap{" "}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e7f900" strokeWidth="2" className="inline -mt-1">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>{" "}
          Share → <span className="font-medium text-white">Add to Home Screen</span>
        </p>
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#e7f900] py-3.5 font-bold text-black transition active:scale-[0.98] ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
