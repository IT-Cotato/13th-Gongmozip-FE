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
  const buttonBaseClassName =
    "flex h-[50px] items-center justify-center rounded-[14px] px-8 py-[9px] text-center font-[Roboto] text-[17px] font-semibold leading-[125%]";
  const className = disabled
    ? `${buttonBaseClassName} w-full bg-[#DFDFDF] text-white`
    : `${buttonBaseClassName} w-full bg-[#FF7658] text-white`;

  return (
    <div className="flex shrink-0 gap-2.5 bg-white px-4 pb-3 pt-2">
      {previousHref && (
        <Link
          className={`${buttonBaseClassName} flex-1 border border-[rgba(97,97,97,0.50)] bg-white text-[#616161]`}
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
