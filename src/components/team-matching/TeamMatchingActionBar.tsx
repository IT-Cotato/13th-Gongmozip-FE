import Link from "next/link";

type TeamMatchingActionBarProps = {
  href: string;
  label: string;
  disabled?: boolean;
};

export default function TeamMatchingActionBar({
  disabled = false,
  href,
  label,
}: TeamMatchingActionBarProps) {
  const className = disabled
    ? "flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#DFDFDF] px-8 py-[9px] text-[18px] font-bold leading-none text-white"
    : "flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] text-[18px] font-bold leading-none text-white";

  return (
    <div className="shrink-0 bg-white px-4 pb-3 pt-2">
      {disabled ? (
        <span aria-disabled="true" className={className}>
          {label}
        </span>
      ) : (
        <Link className={className} href={href}>
          {label}
        </Link>
      )}
    </div>
  );
}
