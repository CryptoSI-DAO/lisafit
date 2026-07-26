import Image from "next/image";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      {/* Generated LF mark */}
      <Image
        src="/logo-full.png"
        alt="LisaFit"
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: size * 0.6 }}
      >
        Lisa<span className="text-[#e7f900]">Fit</span>
      </span>
    </div>
  );
}
