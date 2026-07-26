export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      {/* Geometric "LF" mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="10" fill="#e7f900" />
        <path
          d="M12 10V30M12 10H20M12 20H18"
          stroke="#0a0a0a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 10V30M25 22L30 30M25 22L30 10"
          stroke="#0a0a0a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: size * 0.6 }}
      >
        Lisa<span className="text-[#e7f900]">Fit</span>
      </span>
    </div>
  );
}
