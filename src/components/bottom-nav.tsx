"use client";

import { Logo } from "./logo";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
        <NavItem href="/" label="Today" icon={<HomeIcon />} />
        <NavItem href="/history" label="History" icon={<ChartIcon />} />
        <NavItem href="/profile" label="Profile" icon={<UserIcon />} />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-1 px-6 py-1 text-[#888] transition active:scale-95"
    >
      {icon}
      <span className="text-[0.6rem] font-medium tracking-wide">{label}</span>
    </a>
  );
}

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12L12 3l9 9M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 22c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
  </svg>
);
