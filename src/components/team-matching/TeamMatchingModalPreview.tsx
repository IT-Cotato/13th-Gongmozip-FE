import Link from "next/link";
import type { ReactNode } from "react";

import TeamMatchingPage from "@/app/team-matching/page";

type ModalAction = {
  href: string;
  label: string;
  variant?: "coral" | "outline";
};

type TeamMatchingModalPreviewProps = {
  actions: ModalAction[];
  children?: ReactNode;
  description?: string;
  showCloseButton?: boolean;
  title: ReactNode;
};

function ModalActionLink({ href, label, variant = "coral" }: ModalAction) {
  const variantClassName =
    variant === "outline"
      ? "border border-[rgba(97,97,97,0.40)] bg-white text-[#616161]"
      : "bg-[#FF7658] text-white";

  return (
    <Link
      className={`flex h-12 items-center justify-center self-stretch rounded-[14px] px-[10px] py-[9px] text-center font-[Roboto] text-[14px] font-semibold leading-[125%] ${variantClassName}`}
      href={href}
    >
      {label}
    </Link>
  );
}

export default function TeamMatchingModalPreview({
  actions,
  children,
  description,
  showCloseButton = false,
  title,
}: TeamMatchingModalPreviewProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <TeamMatchingPage />

      <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(31,31,31,0.60)] px-5">
        <section className="relative flex max-h-[400px] w-[350px] shrink-0 flex-col items-center rounded-2xl bg-white px-4 pb-4 pt-2 shadow-[0_53px_15px_0_rgba(0,0,0,0),0_34px_14px_0_rgba(0,0,0,0.01),0_19px_12px_0_rgba(0,0,0,0.05),0_9px_9px_0_rgba(0,0,0,0.09),0_2px_5px_0_rgba(0,0,0,0.10)]">
          {showCloseButton ? (
            <Link
              aria-label="닫기"
              className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center text-[22px] font-normal leading-none text-[#1F1F1F]"
              href="/team-matching"
            >
              ×
            </Link>
          ) : null}

          <div className="flex w-full flex-col items-center px-1 pb-4 pt-4 text-center">
            <h1 className="whitespace-pre-line font-[Pretendard] text-[17px] font-semibold leading-[150%] text-[#1F1F1F]">
              {title}
            </h1>

            {description ? (
              <p className="mt-2 whitespace-pre-line font-[Pretendard] text-[13px] font-medium leading-[150%] text-[#616161]">
                {description}
              </p>
            ) : null}

            {children}
          </div>

          <div className="flex w-full flex-col gap-2">
            {actions.map((action) => (
              <ModalActionLink key={`${action.href}-${action.label}`} {...action} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
