"use client";

import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeftIcon } from "./_components/icons";
import { SuccessModal } from "./_components/SuccessModal";
import { LeaveConfirmModal } from "./_components/LeaveConfirmModal";
import { ContactHistoryCard } from "./_components/ContactHistoryCard";
import { useCreateInquiryMutation } from "@/queries/useCreateInquiryMutation";
import { useInquiryListMutation, type InquirySummary } from "@/queries/useInquiryListMutation";
import { useContactInquiryAuthStore } from "@/stores/contactInquiryAuthStore";
import { ApiError } from "@/lib/http";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TITLE_MAX_LENGTH = 20;
const CONTENT_MAX_LENGTH = 1000;
const PASSWORD_LENGTH = 4;
const HISTORY_LIST_RETURN_TO = "/contact?tab=history&step=list";
const INQUIRY_NOT_FOUND_CODE = "INQUIRY_404_1";

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

function FieldLabel({ children, required = true }: { children: string; required?: boolean }) {
  return (
    <div className="flex items-center px-1 text-[17px] leading-[1.25]">
      <span className="text-[#1F1F1F]">{children}</span>
      {required && <span className="text-[#FF7658]">*</span>}
    </div>
  );
}

function AgreeCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label="개인정보 수집 및 이용 동의"
      className="shrink-0"
    >
      {checked ? (
        <Image
          alt=""
          className="h-8 w-8"
          height={32}
          src="/icons/common/check-circle.svg"
          width={32}
        />
      ) : (
        <span className="block h-8 w-8 rounded-full border-2 border-gray-300" />
      )}
    </button>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageInner />
    </Suspense>
  );
}

function ContactPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const createInquiryMutation = useCreateInquiryMutation();
  const inquiryListMutation = useInquiryListMutation();
  const setContactInquiryAuth = useContactInquiryAuthStore((state) => state.setContactInquiryAuth);
  const contactAuthEmail = useContactInquiryAuthStore((state) => state.email);
  const contactAuthPassword = useContactInquiryAuthStore((state) => state.password);

  const [activeTab, setActiveTab] = useState<"write" | "history">(() =>
    searchParams.get("tab") === "history" ? "history" : "write",
  );
  const [historyStep, setHistoryStep] = useState<"verify" | "list">(() =>
    searchParams.get("step") === "list" ? "list" : "verify",
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [historyEmail, setHistoryEmail] = useState("");
  const [historyPassword, setHistoryPassword] = useState("");
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);

  const isFormValid =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    EMAIL_REGEX.test(email) &&
    password.length === PASSWORD_LENGTH &&
    agreePrivacy;

  const isHistoryFormValid =
    EMAIL_REGEX.test(historyEmail) && historyPassword.length === PASSWORD_LENGTH;

  const hasDraftContent =
    title.trim().length > 0 ||
    content.trim().length > 0 ||
    email.trim().length > 0 ||
    password.trim().length > 0;

  function goToPreviousPage() {
    if (returnTo) {
      router.push(returnTo);
      return;
    }
    router.back();
  }

  function handleBack() {
    if (hasDraftContent) {
      setShowLeaveConfirm(true);
      return;
    }
    goToPreviousPage();
  }

  function handleContinueWriting() {
    setShowLeaveConfirm(false);
  }

  function handleLeave() {
    setShowLeaveConfirm(false);
    goToPreviousPage();
  }

  function handleSubmit() {
    if (!isFormValid || createInquiryMutation.isPending) return;
    setSubmitError(null);

    createInquiryMutation.mutate(
      { email, password, title, content },
      {
        onSuccess: () => setShowSuccessModal(true),
        onError: (error) => {
          setSubmitError(
            error instanceof ApiError ? error.message : "문의 접수에 실패했어요. 다시 시도해주세요.",
          );
        },
      },
    );
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false);
    setTitle("");
    setContent("");
    setEmail("");
    setPassword("");
    setAgreePrivacy(false);
    createInquiryMutation.reset();
  }

  function fetchInquiryList(email: string, password: string) {
    setHistoryError(null);

    inquiryListMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          // 같은 이메일이라도 비밀번호가 다르면 다른 문의를 가리킬 수 있는데,
          // useInquiryDetailQuery의 캐시 키는 이메일까지만 반영해서 이전 인증의
          // 상세 데이터가 남아있을 수 있음 - 새 인증 성공 시 무효화한다.
          queryClient.removeQueries({ queryKey: ["inquiries"] });
          setContactInquiryAuth(email, password);
          setInquiries(data.inquiries);
          setHistoryStep("list");
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === INQUIRY_NOT_FOUND_CODE) {
            setHistoryError("이메일 또는 비밀번호가 일치하지 않아요.");
            return;
          }
          setHistoryError(
            error instanceof ApiError
              ? error.message
              : "문의 내역을 불러오지 못했어요. 다시 시도해주세요.",
          );
        },
      },
    );
  }

  function handleHistoryConfirm() {
    if (!isHistoryFormValid || inquiryListMutation.isPending) return;
    fetchInquiryList(historyEmail, historyPassword);
  }

  function handleRetryHistoryVerify() {
    setInquiries([]);
    setHistoryError(null);
    setHistoryStep("verify");
  }

  // step=list로 새로고침되거나(URL 진입) 상세 화면에서 SPA 네비게이션으로
  // 돌아오면 inquiries state가 초기화돼 있음. 인증 정보가 메모리에 남아있다면
  // 한 번만 자동으로 다시 조회해서 목록을 복원한다.
  const hasAttemptedListRestoreRef = useRef(false);
  useEffect(() => {
    if (
      historyStep !== "list" ||
      inquiries.length > 0 ||
      !contactAuthEmail ||
      !contactAuthPassword ||
      hasAttemptedListRestoreRef.current
    ) {
      return;
    }
    hasAttemptedListRestoreRef.current = true;
    fetchInquiryList(contactAuthEmail, contactAuthPassword);
    // fetchInquiryList는 매 렌더 재생성되는 클로저라 deps에 넣으면 위 ref 가드가
    // 무의미해짐 - ref로 단 한 번만 실행되도록 이미 보장하고 있음.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyStep, inquiries.length, contactAuthEmail, contactAuthPassword]);

  function handleOpenHistoryDetail(inquiryId: number) {
    router.push(
      `/contact/history/${inquiryId}?returnTo=${encodeURIComponent(HISTORY_LIST_RETURN_TO)}`,
    );
  }

  return (
    <main className="flex h-full w-full flex-col overflow-y-auto bg-white">
      <div className="relative flex items-center justify-center px-4 py-1">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로가기"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">문의하기</h1>
      </div>

      <div className="flex items-center px-4">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`flex-1 py-3 text-center text-[17px] leading-[1.35] font-medium ${
            activeTab === "write" ? "text-[#1F1F1F]" : "text-[#949494]"
          }`}
        >
          문의하기
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 text-center text-[17px] leading-[1.35] font-medium ${
            activeTab === "history" ? "text-[#1F1F1F]" : "text-[#949494]"
          }`}
        >
          문의내역
        </button>
      </div>

      {activeTab === "write" ? (
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-1 p-4">
            <FieldLabel>제목</FieldLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))}
              placeholder="문의 제목을 입력해주세요."
              maxLength={TITLE_MAX_LENGTH}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1 p-4">
            <FieldLabel>문의내용</FieldLabel>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX_LENGTH))}
              placeholder="문의 내용을 상세하게 입력해주세요."
              maxLength={CONTENT_MAX_LENGTH}
              className={`h-56 resize-none ${INPUT_CLASS}`}
            />
            <div className="flex w-full justify-end">
              <span className="text-[12px] leading-[1.35] text-[#616161]">
                {content.length}/{CONTENT_MAX_LENGTH}자 제한
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-4">
            <FieldLabel>이메일</FieldLabel>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gongmozip@gongmo-zip.com"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1 p-4">
            <FieldLabel>문의 비밀번호</FieldLabel>
            <input
              type="password"
              inputMode="numeric"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value.replace(/\D/g, "").slice(0, PASSWORD_LENGTH))
              }
              placeholder="비밀번호를 입력해 주세요.(4자리)"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-2.5 p-4">
            <div className="flex w-full items-center gap-3 py-2">
              <div className="flex flex-1 items-center gap-3">
                <AgreeCheckbox checked={agreePrivacy} onToggle={() => setAgreePrivacy((v) => !v)} />
                <div className="flex flex-1 items-center gap-1 text-[13px] leading-[1.5]">
                  <span className="w-8 shrink-0 text-[#AC4A35]">[필수]</span>
                  <span className="flex-1 text-[#1F1F1F]">개인정보 수집 및 이용 동의</span>
                </div>
              </div>
              <button
                type="button"
                aria-label="자세히 보기"
                onClick={() => setIsDetailOpen((v) => !v)}
                className="shrink-0 rounded-xl p-2"
              >
                <Image
                  src="/icons/common/tabler_chevron-right.svg"
                  alt=""
                  height={16}
                  width={16}
                  className={`h-4 w-4 transition-transform ${isDetailOpen ? "rotate-90" : ""}`}
                />
              </button>
            </div>

            {isDetailOpen && (
              <div className="w-full rounded-[14px] bg-[#F5F5F5] px-4 py-2">
                <div className="flex w-full flex-col gap-1.5 p-2 text-[13px] leading-[1.5] text-[#616161]">
                  <p>수집 항목 : 이메일 주소</p>
                  <p>수집 목적 : 문의 접수 및 답변 발송</p>
                  <p>보유 기간 : 문의 처리 완료 후 3개월</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : historyStep === "verify" ? (
        <div className="flex flex-1 flex-col">
          <h2 className="px-6 pt-8 pb-2 text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
            문의할 때 작성했던
            <br />
            정보를 입력해주세요
          </h2>

          <div className="flex flex-col gap-1 p-4">
            <FieldLabel required={false}>이메일</FieldLabel>
            <input
              type="email"
              value={historyEmail}
              onChange={(e) => setHistoryEmail(e.target.value)}
              placeholder="gongmozip@gongmo-zip.com"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1 p-4">
            <FieldLabel required={false}>문의 비밀번호</FieldLabel>
            <input
              type="password"
              inputMode="numeric"
              value={historyPassword}
              onChange={(e) =>
                setHistoryPassword(e.target.value.replace(/\D/g, "").slice(0, PASSWORD_LENGTH))
              }
              placeholder="비밀번호를 입력해 주세요.(4자리)"
              className={INPUT_CLASS}
            />
          </div>
          {historyError && (
            <p role="alert" className="px-5 text-xs leading-[1.35] text-[#BB5260]">
              {historyError}
            </p>
          )}
        </div>
      ) : inquiryListMutation.isPending ? (
        <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
          문의 내역을 불러오는 중이에요...
        </p>
      ) : inquiries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-16">
          <p className="text-[13px] text-[#949494]">
            {historyError ?? "접수된 문의 내역이 없어요."}
          </p>
          <button
            type="button"
            onClick={handleRetryHistoryVerify}
            className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
          >
            다시 조회
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4">
          {inquiries.map((item) => (
            <ContactHistoryCard
              key={item.inquiryId}
              item={item}
              onClick={() => handleOpenHistoryDetail(item.inquiryId)}
            />
          ))}
        </div>
      )}

      {(activeTab === "write" || historyStep === "verify") && (
        <div className="sticky bottom-0 flex flex-col gap-2 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
          {activeTab === "write" ? (
            <>
              {submitError && (
                <p role="alert" className="px-1 text-xs leading-[1.35] text-[#BB5260]">
                  {submitError}
                </p>
              )}
              <button
                type="button"
                disabled={!isFormValid || createInquiryMutation.isPending}
                onClick={handleSubmit}
                className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
                  isFormValid
                    ? "bg-[#FF7658] text-white"
                    : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
                }`}
              >
                {createInquiryMutation.isPending ? "접수 중..." : "제출하기"}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={!isHistoryFormValid || inquiryListMutation.isPending}
              onClick={handleHistoryConfirm}
              className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
                isHistoryFormValid
                  ? "bg-[#FF7658] text-white"
                  : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
              }`}
            >
              {inquiryListMutation.isPending ? "확인 중..." : "확인"}
            </button>
          )}
        </div>
      )}
      {showSuccessModal && <SuccessModal onClose={handleCloseSuccessModal} />}
      {showLeaveConfirm && (
        <LeaveConfirmModal onContinue={handleContinueWriting} onLeave={handleLeave} />
      )}
    </main>
  );
}
