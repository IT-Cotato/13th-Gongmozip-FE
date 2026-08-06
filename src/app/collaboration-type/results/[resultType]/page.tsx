import Image from "next/image";
import { notFound } from "next/navigation";

import {
  COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE,
  COLLABORATION_RESULT_TYPES,
  getCollaborationResultByRouteParam,
} from "../../_data/collaborationTest";

type CollaborationTypeResultPageProps = {
  params: Promise<{
    resultType: string;
  }>;
};

export function generateStaticParams() {
  return [
    ...COLLABORATION_RESULT_TYPES.map((result) => ({
      resultType: result.characterType,
    })),
    ...Object.keys(COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE).map((characterType) => ({
      resultType: characterType,
    })),
    ...COLLABORATION_RESULT_TYPES.map((result) => ({
      resultType: result.id,
    })),
  ];
}

export default async function CollaborationTypeResultPage({
  params,
}: CollaborationTypeResultPageProps) {
  const { resultType } = await params;
  const result = getCollaborationResultByRouteParam(resultType);

  if (!result) {
    notFound();
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <header className="z-10 flex h-[46px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <span className="h-6 w-6" aria-hidden="true" />
        <h1 className="text-center font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#111111]">
          협업 유형 검사
        </h1>
        <button
          aria-label="협업 유형 검사 닫기"
          className="flex h-6 w-6 items-center justify-center"
          type="button"
        >
          <Image alt="" height={24} priority src="/icons/contests/x.svg" width={24} />
        </button>
      </header>

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-7 pt-[38px]">
        <section
          className="mx-auto flex w-[318px] max-w-full flex-col items-center justify-center rounded-[12px] border-2 bg-white py-4"
          style={{ borderColor: result.borderColor }}
        >
          <h2
            className="flex h-[39px] self-stretch items-center justify-center text-center font-[Pretendard] text-[30px] font-bold leading-[135%]"
            style={{ color: result.nameColor }}
          >
            {result.name}
          </h2>

          <p
            className="mt-2 flex h-8 max-w-full items-center justify-center gap-2.5 rounded-[75px] px-[13px] py-2 text-center font-[Pretendard] text-[13px] font-semibold leading-[125%] whitespace-nowrap text-white"
            style={{ width: `${result.quoteBoxWidth}px`, backgroundColor: result.quoteBoxColor }}
          >
            {result.quote}
          </p>

          <div className="mt-2 flex aspect-square h-[140px] w-[140px] items-center justify-center">
            <Image
              alt={`${result.name} 캐릭터`}
              className="h-full w-full object-contain"
              height={140}
              priority
              src={result.imageSrc}
              width={140}
            />
          </div>

          <p
            className="mt-2 w-[286px] max-w-[calc(100%-24px)] text-center font-[Pretendard] text-[12px] font-semibold leading-[135%]"
            style={{ color: result.hashtagColor }}
          >
            {result.hashtags.join(" ")}
          </p>

          <div className="mt-2 flex w-[286px] max-w-[calc(100%-24px)] flex-col items-start justify-center gap-[8px] rounded-[8px] bg-[#F9F8F4] px-[14px] py-4">
            <h3
              className="h-4 self-stretch font-[Pretendard] text-[13px] font-semibold leading-[125%]"
              style={{ color: result.featureTitleColor }}
            >
              당신의 협업스타일의 특징은?
            </h3>

            <div className="flex w-full flex-col gap-[8px]">
              {result.traits.map((trait) => (
                <div
                  className="grid grid-cols-[40px_1fr_40px] items-center gap-[8px]"
                  key={trait.left}
                >
                  <span
                    className="font-[Pretendard] text-[12px] font-semibold leading-[135%]"
                    style={{ color: result.traitLabelColor }}
                  >
                    {trait.left}
                  </span>
                  <div
                    aria-hidden="true"
                    className="relative top-[3px] flex h-[7px] shrink-0 self-stretch overflow-hidden rounded-[90px] bg-[rgba(97,97,97,0.1)]"
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        className="h-full flex-1 border-r border-[#F9F8F4] last:border-r-0"
                        key={index}
                        style={{
                          backgroundColor:
                            index < 4 ? result.traitBarColor : "rgba(97, 97, 97, 0.1)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-right font-['42dot_Sans'] text-[13px] font-medium leading-[125%] text-[#949494]">
                    {trait.right}
                  </span>
                </div>
              ))}
            </div>

            <ul className="w-[258px] max-w-full font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#555555]">
              {result.descriptions.map((description) => (
                <li key={description}>· {description}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="shrink-0 bg-white px-4 pb-3 pt-2">
        <button
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#EFEFEF] px-8 py-[9px] font-[Roboto] text-[15px] font-bold leading-none text-[#616161]"
          type="button"
        >
          나가기
        </button>
        <button
          className="mt-[10px] flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[15px] font-bold leading-none text-white"
          type="button"
        >
          저장하기
        </button>
      </div>
    </main>
  );
}
