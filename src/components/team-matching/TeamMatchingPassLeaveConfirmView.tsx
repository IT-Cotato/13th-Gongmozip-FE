"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import { PassIllustration } from "@/components/team-matching/TeamMatchingPassView";
import { ApiError } from "@/lib/http";
import { useWithdrawMatchingApplicationMutation } from "@/queries/useWithdrawMatchingApplicationMutation";
import { useTeamMatchingProposalStore } from "@/stores/teamMatchingProposalStore";

function PassLeaveNoticeCard() {
  return (
    <section className="relative z-40 mx-auto mt-[30px] flex w-[359px] max-w-full flex-col items-start rounded-[14px] bg-[#F9F8F4] px-4 pb-4 pt-4 text-[#616161]">
      <h2 className="font-[Pretendard] text-[15px] font-medium not-italic leading-[125%] text-[#1F1F1F]">
        다시 한번 생각해보시겠어요?
      </h2>
      <div className="mt-2 h-px w-full bg-[#DFDFDF]" />
      <div className="mt-[17px] flex flex-col gap-1.5 font-[Pretendard] text-[13px] font-normal not-italic leading-[160%] text-[#616161]">
        <ul className="flex flex-col gap-1.5">
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>취소시 협업거리에 패널티를 받게 됩니다.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>
              협업거리 점수가 최근 2주동안 50m 이상 감소한 경우 매칭참여가 1주일 동안 제한됩니다.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">·</span>
            <span>매칭은 하루에 한번만 가능합니다.</span>
          </li>
        </ul>
        <p>해당 매칭결과는 당신의 역량과 성격 유형을 모두 종합하여 매칭한 최고의 팀입니다.</p>
      </div>
    </section>
  );
}

export default function TeamMatchingPassLeaveConfirmView() {
  const router = useRouter();
  const passProposal = useTeamMatchingProposalStore((state) => state.passProposal);
  const pendingProposalId = useTeamMatchingProposalStore((state) => state.pendingProposalId);
  const withdrawMutation = useWithdrawMatchingApplicationMutation();
  const applicationId = pendingProposalId ? Number(pendingProposalId) : null;
  const canPass = Number.isInteger(applicationId);
  const errorMessage = withdrawMutation.error
    ? withdrawMutation.error instanceof ApiError
      ? withdrawMutation.error.message
      : "매칭 패스 중 오류가 발생했어요."
    : null;

  function handlePassClick() {
    if (!canPass || applicationId === null || withdrawMutation.isPending) {
      return;
    }

    withdrawMutation.mutate(applicationId, {
      onSuccess: (data) => {
        passProposal(String(data.applicationId), data.collaborationPenalty);
        router.push("/team-matching/status/pass");
      },
    });
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching/status" title="나의 매칭현황" />

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-[116px]">
        <section className="pt-[52px] text-center">
          <h1 className="font-[Pretendard] text-[20px] font-bold not-italic leading-[135%] text-[#1F1F1F]">
            매칭 결과가 마음에 들지
            <br />
            않으시다니 아쉽네요
          </h1>
        </section>

        <PassIllustration className="mt-[-26px]" />

        <section className="relative z-30 mx-auto mt-[38px] w-[300px] text-center font-[Pretendard] text-[13px] font-normal not-italic leading-[150%] text-[#616161]">
          <p>매칭을 패스하는 경우 협업 거리가 3m씩 줄어들어요.</p>
          <p className="mt-1">다시 한번 생각해보시겠어요?</p>
        </section>

        <PassLeaveNoticeCard />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white px-4 pb-9 pt-3">
        {errorMessage ? (
          <p
            role="alert"
            className="mb-2 text-center font-[Pretendard] text-[12px] font-medium leading-[150%] text-[#D04A2F]"
          >
            {errorMessage}
          </p>
        ) : null}
        <div className="flex items-stretch gap-4">
          <Link
            className="flex h-[50px] flex-1 items-center justify-center self-stretch rounded-[14px] bg-[rgba(97,97,97,0.10)] px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-[#616161]"
            href="/team-matching/status"
          >
            뒤로가기
          </Link>
          <button
            className="flex h-[50px] flex-1 items-center justify-center self-stretch rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-white disabled:bg-[#DFDFDF]"
            disabled={!canPass || withdrawMutation.isPending}
            onClick={handlePassClick}
            type="button"
          >
            {withdrawMutation.isPending ? "패스 중..." : "패스하기"}
          </button>
        </div>
      </div>
    </main>
  );
}
