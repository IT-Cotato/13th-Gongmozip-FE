"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";

import TeamMatchingAlreadyAppliedModal from "@/components/team-matching/TeamMatchingAlreadyAppliedModal";

type TeamMatchingApplyLinkProps = {
  children: ReactNode;
  className: string;
  href: string;
};

const alreadyAppliedHref = "/team-matching/modal-preview/already-applied";

export default function TeamMatchingApplyLink({
  children,
  className,
  href,
}: TeamMatchingApplyLinkProps) {
  const [isAlreadyAppliedModalOpen, setIsAlreadyAppliedModalOpen] = useState(false);

  if (href !== alreadyAppliedHref) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        className={className}
        onClick={() => setIsAlreadyAppliedModalOpen(true)}
        type="button"
      >
        {children}
      </button>
      <TeamMatchingAlreadyAppliedModal
        onClose={() => setIsAlreadyAppliedModalOpen(false)}
        open={isAlreadyAppliedModalOpen}
      />
    </>
  );
}
