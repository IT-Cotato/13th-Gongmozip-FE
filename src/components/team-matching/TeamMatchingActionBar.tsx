import Link from "next/link";

type TeamMatchingActionBarProps = {
  href: string;
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  previousHref?: string;
  previousLabel?: string;
};

export default function TeamMatchingActionBar({
  disabled = false,
  href,
  isLoading = false,
  label,
  onClick,
  previousHref,
  previousLabel = "이전",
}: TeamMatchingActionBarProps) {
  const className = disabled
    ? "flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#DFDFDF] px-8 py-[9px] text-[18px] font-bold leading-none text-white"
    : "flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] text-[18px] font-bold leading-none text-white";

  return (
    <div className="flex shrink-0 gap-2 bg-white px-4 pb-3 pt-2">
      {previousHref && (
        <Link
          className="flex h-[51px] flex-1 items-center justify-center rounded-[14px] border border-[rgba(97,97,97,0.50)] bg-white px-8 py-[9px] text-[18px] font-bold leading-none text-[#616161]"
          href={previousHref}
        >
          {previousLabel}
        </Link>
      )}
      {disabled || onClick ? (
        <button
          className={previousHref ? `${className} flex-1` : className}
          disabled={disabled || isLoading}
          onClick={onClick}
          type="button"
        >
          {isLoading ? "처리 중..." : label}
        </button>
      ) : (
        <Link className={previousHref ? `${className} flex-1` : className} href={href}>
          {label}
        </Link>
      )}
    </div>
  );
}
