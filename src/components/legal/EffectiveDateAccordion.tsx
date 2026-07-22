"use client";

import { useState } from "react";
import { EFFECTIVE_DATE_LABEL, PAST_EFFECTIVE_DATE_LABELS } from "./legalContent";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="#9CA3AF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EffectiveDateAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-5 border-y border-gray-200 py-2.5">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-sm text-gray-800">[현행] {EFFECTIVE_DATE_LABEL}</span>
        <ChevronDownIcon className={isOpen ? "rotate-180" : ""} />
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium text-[#FF5A5A]">[현행] {EFFECTIVE_DATE_LABEL}</p>
          {PAST_EFFECTIVE_DATE_LABELS.map((label, i) => (
            <p key={i} className="text-sm text-gray-400">
              {label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
