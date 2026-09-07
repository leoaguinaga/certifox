import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
  variant?: "dark" | "light";
}

export function Logo({
  className,
  showText = true,
  href = "/",
  variant = "dark",
}: LogoProps) {
  const isLight = variant === "light";

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Certifox Brand Mark */}
      <div className="relative flex items-center justify-center size-5.5 rounded-sm bg-gradient-to-br from-[#FD761A] to-[#E05D04] text-white shadow-sm ring-1 ring-black/5 shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5 text-white"
        >
          <path d="M12 2L4 7v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-5z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5 font-bold tracking-tight">
          <span
            className={cn(
              "text-lg tracking-tight font-extrabold font-sans",
              isLight ? "text-white" : "text-stone-900"
            )}
          >
            Certifox
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
