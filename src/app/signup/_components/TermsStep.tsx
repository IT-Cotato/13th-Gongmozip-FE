import { useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon } from "./icons";

export type TermsState = {
  age14: boolean;
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
};

type TermsItemKey = keyof TermsState;

type TermsStepProps = {
  terms: TermsState;
  onToggleAll: () => void;
  onToggleItem: (key: TermsItemKey) => void;
};

const TERMS_ITEMS: {
  key: TermsItemKey;
  label: string;
  hasDetail: boolean;
  subtext?: string;
}[] = [
  { key: "age14", label: "[필수] 만 14세 이상 확인", hasDetail: true },
  { key: "terms", label: "[필수] 이용약관 동의", hasDetail: true },
  { key: "privacy", label: "[필수] 개인정보 처리방침 동의", hasDetail: true },
  {
    key: "marketing",
    label: "[선택] 광고성 정보 수신 및 마케팅 활용 동의",
    hasDetail: false,
    subtext: "다양한 앱 소식 및 신규 기능 정보를 보내드립니다.",
  },
];

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <img
      src={checked ? "/images/clickedcheck.svg" : "/images/check.svg"}
      alt=""
      className="h-5 w-5 shrink-0"
    />
  );
}

const EFFECTIVE_DATE_LABEL = "2026년 00월 00일 시행안";
const PAST_EFFECTIVE_DATE_LABELS = ["2026년 00월 00일 시행안", "2026년 00월 00일 시행안"];

function EffectiveDateAccordion() {
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

function Age14DetailView({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="mx-auto flex h-full w-full max-w-sm flex-col overflow-y-auto">
        <div className="relative flex items-center justify-center px-4 py-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="absolute left-4 flex h-6 w-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h2 className="text-base font-semibold text-gray-900">만 14세 이상 확인</h2>
        </div>

        <div className="flex-1 px-6 pt-6 pb-10">
          <h1 className="mb-3 text-lg font-bold text-gray-900">만 14세 이상 확인</h1>
          <EffectiveDateAccordion />
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
            <p>본 서비스는 만 14세 이상의 이용자를 대상으로 제공합니다.</p>
            <ul className="space-y-2">
              <li>
                • 회원은 회원가입 시 본인이 만 14세 이상임을 확인하며, 허위 정보 입력으로 발생하는
                책임은 회원 본인에게 있습니다.
              </li>
              <li>• 회사는 필요한 경우 연령 확인을 위한 추가 인증을 요청할 수 있습니다.</li>
            </ul>
            <p>위 내용에 동의하는 경우 본인이 만 14세 이상임을 확인한 것으로 간주합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsStep({ terms, onToggleAll, onToggleItem }: TermsStepProps) {
  const [isAge14DetailOpen, setIsAge14DetailOpen] = useState(false);
  const allChecked = terms.age14 && terms.terms && terms.privacy && terms.marketing;

  return (
    <div>
      <button
        type="button"
        onClick={onToggleAll}
        className="flex w-full items-center gap-2 border-b border-gray-100 pb-4"
      >
        <CheckIcon checked={allChecked} />
        <span className="text-sm font-semibold text-gray-900">모두 동의하기 (선택 정보 포함)</span>
      </button>

      <ul>
        {TERMS_ITEMS.map((item) => (
          <li key={item.key} className="flex items-center gap-2 py-3">
            <button
              type="button"
              onClick={() => onToggleItem(item.key)}
              className="flex flex-1 items-center gap-2 text-left"
            >
              <CheckIcon checked={terms[item.key]} />
              <div>
                <span className="text-sm text-gray-800">{item.label}</span>
                {item.subtext && <p className="mt-1 text-xs text-gray-400">{item.subtext}</p>}
              </div>
            </button>
            {item.hasDetail && (
              <button
                type="button"
                aria-label="자세히 보기"
                className="shrink-0 p-1"
                onClick={() => {
                  if (item.key === "age14") setIsAge14DetailOpen(true);
                }}
              >
                <img src="/images/tabler_chevron-right.svg" alt="" className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {isAge14DetailOpen && <Age14DetailView onBack={() => setIsAge14DetailOpen(false)} />}
    </div>
  );
}
