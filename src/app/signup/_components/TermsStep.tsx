import Image from "next/image";
import { useState, type ReactNode } from "react";
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
    <Image
      src={checked ? "/images/clickedcheck.svg" : "/images/check.svg"}
      alt=""
      height={20}
      width={20}
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

function LegalDetailView({
  headerTitle,
  bodyTitle,
  onBack,
  children,
}: {
  headerTitle: string;
  bodyTitle: string;
  onBack: () => void;
  children: ReactNode;
}) {
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
          <h2 className="text-base font-semibold text-gray-900">{headerTitle}</h2>
        </div>

        <div className="flex-1 px-6 pt-6 pb-10">
          <h1 className="mb-3 text-lg font-bold text-gray-900">{bodyTitle}</h1>
          <EffectiveDateAccordion />
          {children}
        </div>
      </div>
    </div>
  );
}

function Age14DetailView({ onBack }: { onBack: () => void }) {
  return (
    <LegalDetailView headerTitle="만 14세 이상 확인" bodyTitle="만 14세 이상 확인" onBack={onBack}>
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
    </LegalDetailView>
  );
}

type TermsArticle = {
  title: string;
  intro?: string;
  body?: string;
  items?: string[];
};

const TERMS_ARTICLES: TermsArticle[] = [
  {
    title: "제1조 목적",
    body: '본 약관은 회사가 제공하는 공모전 팀원 매칭 서비스(이하 "공모집")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
  },
  {
    title: "제2조 회원가입",
    items: [
      "회원은 본 약관에 동의하고 회사가 정한 절차에 따라 회원가입을 신청할 수 있습니다.",
      "회원은 정확하고 최신의 정보를 제공해야 합니다.",
      "허위 정보를 입력하거나 타인의 정보를 도용한 경우 서비스 이용이 제한될 수 있습니다.",
    ],
  },
  {
    title: "제3조 서비스 내용",
    intro: "회사는 다음과 같은 서비스를 제공합니다.",
    items: [
      "공모전 정보 제공",
      "팀원 모집 및 지원 기능",
      "회원 간 매칭 서비스",
      "채팅 및 커뮤니케이션 기능",
      "기타 회사가 제공하는 관련 서비스",
    ],
  },
  {
    title: "제4조 회원의 의무",
    intro: "회원은 다음 행위를 해서는 안 됩니다.",
    items: [
      "타인의 개인정보 또는 계정 도용",
      "허위 경력, 포트폴리오, 학력 등의 등록",
      "욕설, 비방, 차별, 혐오 표현 게시",
      "광고, 스팸, 홍보 목적의 무분별한 게시",
      "법령 또는 공공질서에 위반되는 행위",
    ],
  },
  {
    title: "제5조 매칭 서비스의 특성",
    items: [
      "회사는 회원 간 매칭 기회를 제공할 뿐, 특정 매칭 결과를 보장하지 않습니다.",
      "팀 프로젝트 진행 과정에서 발생하는 분쟁, 손해, 계약 관계 등에 대해서는 당사자 간 해결을 원칙으로 합니다.",
      "회사는 회원이 작성한 정보의 정확성 및 신뢰성을 보증하지 않습니다.",
    ],
  },
  {
    title: "제6조 게시물",
    items: [
      "회원이 작성한 게시물의 책임은 작성자에게 있습니다.",
      "회사는 운영 정책 또는 관련 법령을 위반한 게시물을 사전 통지 없이 삭제하거나 제한할 수 있습니다.",
    ],
  },
  {
    title: "제7조 서비스 이용 제한",
    body: "회사는 본 약관 또는 관련 법령을 위반한 회원에 대해 경고, 게시물 삭제, 이용 제한, 회원 자격 박탈 등의 조치를 취할 수 있습니다.",
  },
  {
    title: "제8조 면책사항",
    body: "회사는 천재지변, 시스템 장애 등 불가항력적 사유로 인한 서비스 제공의 중단에 대해 책임을 지지 않습니다.",
  },
  {
    title: "제9조 문의",
    body: "회원은 서비스 이용 중 발생한 문의사항을 문의하기 기능을 통해 접수할 수 있습니다.",
  },
];

function TermsDetailView({ onBack }: { onBack: () => void }) {
  return (
    <LegalDetailView
      headerTitle="공모집 이용약관"
      bodyTitle="공모집 서비스 이용약관"
      onBack={onBack}
    >
      <div className="space-y-5 text-sm leading-relaxed text-gray-700">
        {TERMS_ARTICLES.map((article) => (
          <section key={article.title}>
            <h3 className="mb-1.5 font-semibold text-gray-900">{article.title}</h3>
            {article.body && <p>{article.body}</p>}
            {article.intro && <p className="mb-1.5">{article.intro}</p>}
            {article.items && (
              <ul className="space-y-1">
                {article.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </LegalDetailView>
  );
}

type PrivacySection = {
  title: string;
  body?: string;
  items?: string[];
  groups?: { label: string; items: string[] }[];
};

const PRIVACY_INTRO =
  "회사는 회원가입 및 서비스 제공을 위해 다음과 같이 개인정보를 수집·이용합니다.";

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: "1. 수집 항목",
    groups: [
      { label: "필수 항목", items: ["성별", "생년월일", "이메일 주소"] },
      {
        label: "선택 항목",
        items: ["닉네임", "학교", "전공", "관심 분야", "경력 및 포트폴리오 정보"],
      },
    ],
  },
  {
    title: "2. 수집 목적",
    items: [
      "회원 식별 및 본인 확인",
      "팀원 매칭 서비스 제공",
      "회원 간 소통 지원",
      "고객 문의 응대",
      "서비스 개선 및 운영",
    ],
  },
  {
    title: "3. 보유 및 이용 기간",
    body: "회원 탈퇴 시까지 보관하며, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관 후 안전하게 파기합니다.",
  },
  {
    title: "4. 개인정보 제3자 제공",
    body: "회사는 회원의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 따른 경우는 예외로 합니다.",
  },
  {
    title: "5. 이용자의 권리",
    body: "회원은 언제든지 개인정보 조회, 수정, 삭제 및 회원 탈퇴를 요청할 수 있습니다.",
  },
  {
    title: "6. 개인정보 보호",
    body: "회사는 개인정보 보호를 위해 관련 법령에 따른 기술적·관리적 보호조치를 시행합니다.",
  },
];

function PrivacyDetailView({ onBack }: { onBack: () => void }) {
  return (
    <LegalDetailView
      headerTitle="개인정보 처리방침"
      bodyTitle="개인정보 처리방침 동의"
      onBack={onBack}
    >
      <div className="space-y-5 text-sm leading-relaxed text-gray-700">
        <p>{PRIVACY_INTRO}</p>
        {PRIVACY_SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="mb-1.5 font-semibold text-gray-900">{section.title}</h3>
            {section.body && <p>{section.body}</p>}
            {section.items && (
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}
            {section.groups && (
              <div className="space-y-2">
                {section.groups.map((group) => (
                  <div key={group.label}>
                    <p>• {group.label}</p>
                    <ul className="ml-4 space-y-1">
                      {group.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </LegalDetailView>
  );
}

export function TermsStep({ terms, onToggleAll, onToggleItem }: TermsStepProps) {
  const [isAge14DetailOpen, setIsAge14DetailOpen] = useState(false);
  const [isTermsDetailOpen, setIsTermsDetailOpen] = useState(false);
  const [isPrivacyDetailOpen, setIsPrivacyDetailOpen] = useState(false);
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
                  if (item.key === "terms") setIsTermsDetailOpen(true);
                  if (item.key === "privacy") setIsPrivacyDetailOpen(true);
                }}
              >
                <Image
                  alt=""
                  className="h-4 w-4"
                  height={16}
                  src="/images/tabler_chevron-right.svg"
                  width={16}
                />
              </button>
            )}
          </li>
        ))}
      </ul>

      {isAge14DetailOpen && <Age14DetailView onBack={() => setIsAge14DetailOpen(false)} />}
      {isTermsDetailOpen && <TermsDetailView onBack={() => setIsTermsDetailOpen(false)} />}
      {isPrivacyDetailOpen && <PrivacyDetailView onBack={() => setIsPrivacyDetailOpen(false)} />}
    </div>
  );
}
