"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import TeamMatchingAlreadyAppliedModal from "@/components/team-matching/TeamMatchingAlreadyAppliedModal";
import TeamMatchingApplicationClosedModal from "@/components/team-matching/TeamMatchingApplicationClosedModal";
import { isMatchingApplicationClosedTime } from "@/lib/matchingSchedule";

type TeamMatchingApplyLinkProps = {
  children: ReactNode;
  className: string;
  href: string;
};

const alreadyAppliedHref = "/team-matching/modal-preview/already-applied";

export function useIsMatchingApplicationClosedTime() {
  const [isClosedTime, setIsClosedTime] = useState(false);

  useEffect(() => {
    const updateClosedTime = () => setIsClosedTime(isMatchingApplicationClosedTime());
    const intervalId = window.setInterval(updateClosedTime, 30 * 1000);

    updateClosedTime();

    return () => window.clearInterval(intervalId);
  }, []);

  return isClosedTime;
}

export default function TeamMatchingApplyLink({
  children,
  className,
  href,
}: TeamMatchingApplyLinkProps) {
  const pathname = usePathname();

  return (
    <TeamMatchingApplyLinkContent
      key={pathname}
      className={className}
      href={href}
    >
      {children}
    </TeamMatchingApplyLinkContent>
  );
}

function TeamMatchingApplyLinkContent({
  children,
  className,
  href,
}: TeamMatchingApplyLinkProps) {
  const [isAlreadyAppliedModalOpen, setIsAlreadyAppliedModalOpen] = useState(false);
  const [isApplicationClosedModalOpen, setIsApplicationClosedModalOpen] = useState(false);
  const isClosedTime = useIsMatchingApplicationClosedTime();

  useEffect(() => {
    const closeModals = () => {
      setIsAlreadyAppliedModalOpen(false);
      setIsApplicationClosedModalOpen(false);
    };

    window.addEventListener("pageshow", closeModals);

    return () => {
      window.removeEventListener("pageshow", closeModals);
    };
  }, []);

  if (href === alreadyAppliedHref) {
    return (
      <>
        <button
          className={className}
          onClick={() => setIsAlreadyAppliedModalOpen(true)}
          type="button"
        >
          {children}
        </button>
        {isAlreadyAppliedModalOpen ? (
          <TeamMatchingAlreadyAppliedModal
            onClose={() => setIsAlreadyAppliedModalOpen(false)}
            open={isAlreadyAppliedModalOpen}
          />
        ) : null}
      </>
    );
  }

  if (isClosedTime) {
    return (
      <>
        <button
          className={className}
          onClick={() => setIsApplicationClosedModalOpen(true)}
          type="button"
        >
          {children}
        </button>
        {isApplicationClosedModalOpen ? (
          <TeamMatchingApplicationClosedModal
            onClose={() => setIsApplicationClosedModalOpen(false)}
            open={isApplicationClosedModalOpen}
          />
        ) : null}
      </>
    );
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
