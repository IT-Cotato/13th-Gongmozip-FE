"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/http";
import { fetchSurveyResult, surveyResultQueryKey } from "@/queries/useSurveyResultQuery";
import { useSurveyQuestionsQuery } from "@/queries/useSurveyQuestionsQuery";
import { useSubmitSurveyMutation } from "@/queries/useSubmitSurveyMutation";
import { useCollaborationTestStore } from "@/stores/collaborationTestStore";

import CollaborationResultPendingLeaveModal from "../_components/CollaborationResultPendingLeaveModal";
import { COLLABORATION_TEST_TOTAL_QUESTION_COUNT } from "../_data/collaborationTest";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "existing" }
  | { status: "error"; error: unknown };

export default function CollaborationTypeResultLoadingPage() {
  const queryClient = useQueryClient();
  const { mutateAsync: submitSurveyAsync, isPending: isSubmitSurveyPending } =
    useSubmitSurveyMutation();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [resultHref, setResultHref] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [retryAttempt, setRetryAttempt] = useState(0);
  const submittedRequestRef = useRef<{
    answersKey: string;
    attempt: number;
  } | null>(null);
  const inFlightSubmitRef = useRef<{
    answersKey: string;
    attempt: number;
    request: ReturnType<typeof submitSurveyAsync>;
  } | null>(null);
  const submittedCharacterType = useCollaborationTestStore((state) => state.submittedCharacterType);
  const responses = useCollaborationTestStore((state) => state.responses);
  const resetResponses = useCollaborationTestStore((state) => state.resetResponses);
  const setSubmittedCharacterType = useCollaborationTestStore(
    (state) => state.setSubmittedCharacterType,
  );
  const { data: questions = [] } = useSurveyQuestionsQuery();
  const requiredQuestionCount = questions.length || COLLABORATION_TEST_TOTAL_QUESTION_COUNT;
  const answers = useMemo(() => {
    const responseList =
      questions.length > 0
        ? questions
            .map((question) => responses[question.questionId])
            .filter((response) => response !== undefined)
        : Object.values(responses);

    return responseList
      .map((response) => ({
        questionId: response.questionId,
        selectedOptionId: response.optionId,
      }))
      .sort((currentAnswer, nextAnswer) => {
        return currentAnswer.questionId - nextAnswer.questionId;
      });
  }, [questions, responses]);
  const answersKey = useMemo(() => {
    return answers.map((answer) => `${answer.questionId}:${answer.selectedOptionId}`).join("|");
  }, [answers]);
  const isEveryQuestionAnswered = answers.length >= requiredQuestionCount;
  const submitError = submitState.status === "error" ? submitState.error : null;
  const isUnauthorized = submitError instanceof ApiError && submitError.status === 401;
  const isSurveyRetakeLimited =
    submitError instanceof ApiError && submitError.code === "SURVEY_409_1";
  const errorMessage =
    submitError instanceof ApiError
      ? isUnauthorized
        ? "로그인이 필요한 검사입니다. 다시 로그인해 주세요."
        : isSurveyRetakeLimited
          ? "협업 유형 검사는 3개월에 한 번만 다시 응시할 수 있어요."
          : submitError.code === "COMMON_409_1"
            ? "동시에 처리된 요청과 충돌했습니다. 다시 시도해 주세요."
            : submitError.code === "COMMON_409_2"
              ? "다른 요청이 처리 중입니다. 잠시 후 다시 시도해 주세요."
              : submitError.message
      : "검사 결과를 제출하지 못했습니다.";
  const isSubmitting = submitState.status === "submitting";
  const isSubmitted = submitState.status === "success" || submitState.status === "existing";
  const hasExistingResult = submitState.status === "existing";
  const hasSubmitError = submitState.status === "error";

  useEffect(() => {
    let isCurrent = true;

    if (!isEveryQuestionAnswered || !answersKey) {
      return;
    }

    const inFlightSubmit = inFlightSubmitRef.current;
    const submitRequest =
      inFlightSubmit?.answersKey === answersKey && inFlightSubmit.attempt === retryAttempt
        ? inFlightSubmit.request
        : null;

    const submittedRequest = submittedRequestRef.current;

    if (
      submittedRequest?.answersKey === answersKey &&
      submittedRequest.attempt === retryAttempt &&
      !submitRequest
    ) {
      return;
    }

    if (!submitRequest && isSubmitSurveyPending) {
      return;
    }

    const request =
      submitRequest ??
      submitSurveyAsync({ answers }).finally(() => {
        const currentSubmit = inFlightSubmitRef.current;

        if (currentSubmit?.answersKey === answersKey && currentSubmit.attempt === retryAttempt) {
          inFlightSubmitRef.current = null;
        }
      });

    if (!submitRequest) {
      submittedRequestRef.current = {
        answersKey,
        attempt: retryAttempt,
      };
      inFlightSubmitRef.current = {
        answersKey,
        attempt: retryAttempt,
        request,
      };
    }

    setSubmitState({ status: "submitting" });

    request
      .then((result) => {
        if (!isCurrent) return;

        setResultHref(`/collaboration-type/results/${result.characterType}`);
        setSubmittedCharacterType(result.characterType);
        setSubmitState({ status: "success" });
        resetResponses();
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;

        if (error instanceof ApiError && error.code === "SURVEY_409_1") {
          if (submittedCharacterType) {
            setResultHref(`/collaboration-type/results/${submittedCharacterType}`);
            setSubmitState({ status: "existing" });

            return;
          }

          queryClient
            .fetchQuery({
              queryKey: surveyResultQueryKey,
              queryFn: fetchSurveyResult,
              retry: false,
            })
            .then((result) => {
              if (!isCurrent) return;

              setResultHref(`/collaboration-type/results/${result.characterType}`);
              setSubmittedCharacterType(result.characterType);
              setSubmitState({ status: "existing" });
            })
            .catch(() => {
              if (!isCurrent) return;

              setSubmitState({
                status: "error",
                error: new ApiError(
                  error.status,
                  "기존 검사 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
                  error.code,
                ),
              });
            });

          return;
        }

        setSubmitState({ status: "error", error });
      });

    return () => {
      isCurrent = false;
    };
  }, [
    answers,
    answersKey,
    isEveryQuestionAnswered,
    isSubmitSurveyPending,
    queryClient,
    retryAttempt,
    resetResponses,
    setSubmittedCharacterType,
    submitSurveyAsync,
    submittedCharacterType,
  ]);

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <header className="z-10 flex h-[46px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <span className="h-6 w-6" aria-hidden="true" />
        <h1 className="flex h-[38px] flex-col justify-center text-center font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#111111]">
          협업 유형 검사
        </h1>
        <button
          aria-label="협업 유형 검사 닫기"
          className="flex h-6 w-6 items-center justify-center"
          onClick={() => setIsLeaveModalOpen(true)}
          type="button"
        >
          <Image alt="" height={24} priority src="/icons/contests/x.svg" width={24} />
        </button>
      </header>

      <div className="scrollbar-hidden relative min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <Image
          alt=""
          className="pointer-events-none absolute inset-x-0 top-[84px] z-0 h-[570px] w-full object-cover"
          height={751}
          priority
          src="/icons/contests/Frame.svg"
          width={390}
        />

        <section className="relative z-10 pt-[49px] text-center">
          <h2 className="text-center font-[Pretendard] text-[20px] font-bold leading-[135%] text-[#1F1F1F]">
            {isSubmitting
              ? "검사 결과를 분석하고 있어요"
              : isSubmitted
                ? hasExistingResult
                  ? "기존 검사 결과가 있어요"
                  : "검사가 완료되었어요!"
                : hasSubmitError
                  ? "검사 결과를 제출하지 못했어요"
                  : "검사 답변을 확인해 주세요"}
          </h2>
          <p className="mt-[17px] text-center font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
            {isSubmitting ? (
              <>
                제출한 답변을 바탕으로
                <br />
                협업 유형을 계산하고 있어요.
              </>
            ) : isSubmitted ? (
              hasExistingResult ? (
                <>
                  협업 유형 검사는 3개월에 한 번만 다시 응시할 수 있어요.
                  <br />
                  이전에 제출한 협업 유형을 확인해 보세요.
                </>
              ) : (
                <>
                  15개의 문항에 모두 답변해 주셔서 감사합니다.
                  <br />
                  이제 나의 협업 유형을 확인해 보세요.
                </>
              )
            ) : hasSubmitError ? (
              errorMessage
            ) : (
              <>
                아직 답변하지 않은 문항이 있어요.
                <br />
                모든 문항에 답변한 뒤 다시 제출해 주세요.
              </>
            )}
          </p>

          <Image
            alt="협업 유형 검사 완료 캐릭터"
            className="mx-auto mt-[85px] h-[308px] w-[308px] max-w-full object-contain"
            height={308}
            priority
            src="/images/test/test.png"
            width={308}
          />
        </section>
      </div>

      <div className="shrink-0 bg-white px-4 pb-3 pt-2">
        {isSubmitted && resultHref ? (
          <Link
            className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white"
            href={resultHref}
          >
            {hasExistingResult ? "기존 결과 보기" : "검사 결과 확인하기"}
          </Link>
        ) : hasSubmitError && isUnauthorized ? (
          <Link
            className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white"
            href="/login/email"
          >
            로그인하기
          </Link>
        ) : hasSubmitError && isSurveyRetakeLimited ? (
          <Link
            className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white"
            href="/mypage"
          >
            마이페이지로 가기
          </Link>
        ) : isEveryQuestionAnswered ? (
          <button
            className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white disabled:bg-[#EFEFEF] disabled:text-[#C8C8C8]"
            disabled={isSubmitting}
            onClick={() => {
              setSubmitState({ status: "idle" });
              setRetryAttempt((currentAttempt) => currentAttempt + 1);
            }}
            type="button"
          >
            {isSubmitting ? "분석 중" : "다시 제출하기"}
          </button>
        ) : (
          <Link
            className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white"
            href="/collaboration-type/questions/1"
          >
            답변하러 가기
          </Link>
        )}
      </div>

      <CollaborationResultPendingLeaveModal
        onOpenChange={setIsLeaveModalOpen}
        open={isLeaveModalOpen}
        resultHref={resultHref}
      />
    </main>
  );
}
