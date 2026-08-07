"use client";

import Image from "next/image";
import Link from "next/link";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import {
  type MatchingExplanationSection,
  useMatchingExplanationsQuery,
} from "@/queries/useMatchingExplanationsQuery";

const itemToneClassNames = [
  "bg-[#FFF1EE] text-[#AC4A35]",
  "bg-[#EBF7FE] text-[#184966]",
  "bg-[#EEFBF2] text-[#318249]",
  "bg-[#FEFDEA] text-[#625E10]",
  "bg-[rgba(97,97,97,0.10)] text-[#616161]",
];

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(date);
}

function NoticeSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="AI 분석 매칭 안내 불러오는 중">
      {[0, 1, 2].map((sectionIndex) => (
        <section className="animate-pulse" key={sectionIndex}>
          <div className="h-7 w-3/4 rounded bg-[#F5F5F5]" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-[#F5F5F5]" />
            <div className="h-4 w-11/12 rounded bg-[#F5F5F5]" />
            <div className="h-4 w-4/5 rounded bg-[#F5F5F5]" />
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionItems({ section }: { section: MatchingExplanationSection }) {
  if (section.items.length === 0) {
    return null;
  }

  const hasItemDescriptions = section.items.some(
    (item) => (item.description ?? "").trim().length > 0,
  );

  if (!hasItemDescriptions) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {section.items.map((item, index) => (
          <span
            className={`flex items-center justify-center gap-[10px] rounded-full px-3 py-1 font-[Pretendard] text-[12px] font-semibold leading-[135%] ${
              itemToneClassNames[index % itemToneClassNames.length]
            }`}
            key={`${section.type}-${item.title}`}
          >
            {item.title}
          </span>
        ))}
      </div>
    );
  }

  return (
    <ul className="mt-3 space-y-2">
      {section.items.map((item, index) => (
        <li
          className="rounded-xl bg-[#F9F8F4] px-4 py-3 font-[Pretendard]"
          key={`${section.type}-${item.title}-${index}`}
        >
          <p
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold leading-[135%] ${
              itemToneClassNames[index % itemToneClassNames.length]
            }`}
          >
            {item.title}
          </p>
          <p className="mt-2 whitespace-pre-line text-[12px] font-normal leading-[150%] text-[#616161]">
            {item.description ?? ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ExplanationSection({ section }: { section: MatchingExplanationSection }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-[Pretendard] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
        {section.title}
      </h2>
      <p className="mt-3 whitespace-pre-line font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
        {section.description}
      </p>
      <SectionItems section={section} />
    </section>
  );
}

export default function TeamMatchingAiNoticePage() {
  const { data, isError, isLoading, refetch } = useMatchingExplanationsQuery();
  const updatedDate = data?.updatedAt ? formatDateTime(data.updatedAt) : null;

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching" title="AI 분석 매칭 안내" />

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-8">
        <section>
          <h2 className="whitespace-pre-line font-[Pretendard] text-[26px] font-bold leading-[135%] text-[#1F1F1F]">
            {data?.title ?? "AI 분석 매칭 안내"}
          </h2>
          <p className="mt-3 whitespace-pre-line font-[Pretendard] text-[17px] font-medium leading-[150%] text-[#1F1F1F]">
            {data?.summary ?? "공모집의 AI 분석 매칭 정보를 불러오고 있어요."}
          </p>

          <Image
            alt="팀 매칭 AI 분석 캐릭터"
            className="mx-auto mt-3 h-auto w-[296px]"
            height={296}
            priority
            src="/images/team-matching/teammatching_ai.png"
            width={296}
          />
        </section>

        <div className="mt-4">
          {isLoading ? <NoticeSkeleton /> : null}

          {isError ? (
            <section className="mt-4 rounded-2xl bg-[#F5F5F5] px-5 py-6 text-center">
              <h2 className="font-[Pretendard] text-[17px] font-bold leading-[135%] text-[#1F1F1F]">
                안내 정보를 불러오지 못했어요
              </h2>
              <p className="mt-2 font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
                잠시 후 다시 시도해 주세요.
              </p>
              <button
                className="mt-4 inline-flex h-10 items-center justify-center rounded-[12px] bg-[#FF7658] px-5 font-[Pretendard] text-[14px] font-semibold text-white"
                onClick={() => void refetch()}
                type="button"
              >
                다시 불러오기
              </button>
            </section>
          ) : null}

          {data?.sections.map((section, index) => (
            <ExplanationSection
              key={`${section.type}-${section.title}-${index}`}
              section={section}
            />
          ))}
        </div>

        {data?.disclaimer ? (
          <section className="mt-8 rounded-2xl bg-[#F5F5F5] px-4 py-3">
            <p className="whitespace-pre-line font-[Pretendard] text-[12px] font-normal leading-[150%] text-[#616161]">
              {data.disclaimer}
            </p>
            {updatedDate ? (
              <p className="mt-2 font-[Pretendard] text-[11px] font-normal leading-[135%] text-[#949494]">
                최근 업데이트 {updatedDate}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="mt-8 flex w-[350px] max-w-full flex-col items-center gap-[14px] rounded-2xl bg-[#F5F5F5] p-5 text-center">
          <p className="text-center font-[Pretendard] text-[17px] font-medium leading-[135%] text-[#1F1F1F]">
            지금 바로 팀 매칭을 시작해보세요!
          </p>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-white"
            href="/team-matching/profile"
          >
            매칭 신청하기
          </Link>
        </section>
      </div>
    </main>
  );
}
