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

export function TermsStep({ terms, onToggleAll, onToggleItem }: TermsStepProps) {
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
              <button type="button" aria-label="자세히 보기" className="shrink-0 p-1">
                <img src="/images/tabler_chevron-right.svg" alt="" className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
