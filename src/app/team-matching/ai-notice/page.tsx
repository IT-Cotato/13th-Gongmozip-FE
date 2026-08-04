import Image from "next/image";
import Link from "next/link";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";

const styleTags = [
  { label: "#우호성", className: "bg-[#FFF1EE] text-[#AC4A35]" },
  { label: "#정직-겸손성", className: "bg-[#EBF7FE] text-[#184966]" },
  { label: "#성실성", className: "bg-[#EEFBF2] text-[#318249]" },
  { label: "#외향성", className: "bg-[#FEFDEA] text-[#625E10]" },
];

const combinationTags = [
  "# 공모전 참여 목표",
  "# 일정 관리 방식 (성실도)",
  "# 소통 방식 (외향성)",
  "# 리더 선호 정도",
  "# 기타 등등",
];

export default function TeamMatchingAiNoticePage() {
  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching" title="AI 분석 매칭 안내" />

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-8">
        <section>
          <h2 className="font-[Pretendard] text-[26px] font-bold leading-[135%] text-[#1F1F1F]">
            가장 빠른 공모전 팀 찾기,
            <br />
            공모집에서
          </h2>
          <p className="mt-3 font-[Pretendard] text-[17px] font-medium leading-[150%] text-[#1F1F1F]">
            공모집은 HEXACO 성격이론을 기반으로
            <br />
            개인 프로필과 성격 유형검사 결과를 반영하여
            <br />
            최적의 팀을 구성합니다.
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

        <section className="mt-4">
          <h2 className="font-[Pretendard] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
            심리학 기반 협업 스타일 분석
          </h2>
          <p className="mt-3 font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
            본 서비스는 성격심리학 연구에서 활용되는
            <br />
            HEXACO 이론을 기반으로 만든 자체 검사를 통해
            <br />
            협업에 중요한 특성을 분석합니다.
            <br />
            특히 공모전 협업 과정에서 발생할 수 있는
            <br />
            갈등, 책임감, 의사소통 스타일을 중심으로 평가합니다.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {styleTags.map(({ label, className }) => (
              <span
                className={`flex items-center justify-center gap-[10px] rounded-full px-3 py-1 font-[Pretendard] text-[12px] font-semibold leading-[135%] ${className}`}
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-[Pretendard] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
            협업 유형 검사 조합 분석
          </h2>
          <p className="mt-3 font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
            좋은 팀은 단순히 유사한 특성의 사람들을 구성한다고
            <br />
            만들어지지 않습니다.
            <br />
            조직심리학 이론을 기반으로 역량, 협업스타일,
            <br />
            성격의 유사성과 상보성이 적절한 팀 조합을 고려합니다.
            <br />
            구체적으로는 다음과 같은 요소를 함께 고려합니다.
          </p>

          <div className="mt-3 flex flex-wrap gap-1">
            {combinationTags.map((label) => (
              <span
                className="flex items-center justify-center gap-[10px] rounded-full bg-[rgba(97,97,97,0.10)] px-3 py-1 font-[Pretendard] text-[12px] font-semibold leading-[135%] text-[#616161]"
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-[Pretendard] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
            팀 시너지 최적화
          </h2>
          <p className="mt-3 font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
            매칭에는 많은 사용자가 동시에 참여하기 때문에,
            <br />
            특정 팀 하나의 궁합만 높이는 방식은 사용하지 않습니다.
            <br />
            자체 개발한 매칭 알고리즘은
            <br />
            수많은 팀 조합을 반복적으로 분석하여
            <br />
            전체 팀들의 시너지가 가장 높아지는 방향으로 최적화합니다.
            <br />
            이를 통해 사용자들에게 보다 균형 있고 만족도 높은
            <br />팀 구성을 제공합니다.
          </p>
        </section>

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
