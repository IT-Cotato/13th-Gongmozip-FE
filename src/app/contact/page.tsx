"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon } from "./_components/icons";
import { SuccessModal } from "./_components/SuccessModal";
import { LeaveConfirmModal } from "./_components/LeaveConfirmModal";
import { ContactHistoryCard } from "./_components/ContactHistoryCard";
import { MOCK_CONTACT_HISTORY } from "./_data/mockHistory";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TITLE_MAX_LENGTH = 20;
const CONTENT_MAX_LENGTH = 1000;
const PASSWORD_LENGTH = 4;
const HISTORY_LIST_RETURN_TO = "/contact?tab=history&step=list";

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
        <img src="/images/check-circle.svg" alt="" className="h-8 w-8" />
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
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

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

  const [historyEmail, setHistoryEmail] = useState("");
  const [historyPassword, setHistoryPassword] = useState("");

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
    if (!isFormValid) return;
    // TODO(backend): 문의 접수 API 연동 전까지 성공 팝업만 임시로 표시
    setShowSuccessModal(true);
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false);
    setTitle("");
    setContent("");
    setEmail("");
    setPassword("");
    setAgreePrivacy(false);
  }

  function handleHistoryConfirm() {
    if (!isHistoryFormValid) return;
    // TODO(backend): 문의 내역 조회 API 연동 전까지 목데이터로 임시 표시
    setHistoryStep("list");
  }

  function handleOpenHistoryDetail(id: string) {
    router.push(`/contact/history/${id}?returnTo=${encodeURIComponent(HISTORY_LIST_RETURN_TO)}`);
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
                  <AgreeCheckbox
                    checked={agreePrivacy}
                    onToggle={() => setAgreePrivacy((v) => !v)}
                  />
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
                  <img
                    src="/images/tabler_chevron-right.svg"
                    alt=""
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
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 p-4">
            {MOCK_CONTACT_HISTORY.map((item) => (
              <ContactHistoryCard
                key={item.id}
                item={item}
                onClick={() => handleOpenHistoryDetail(item.id)}
              />
            ))}
          </div>
        )}

        {(activeTab === "write" || historyStep === "verify") && (
          <div className="sticky bottom-0 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
            {activeTab === "write" ? (
              <button
                type="button"
                disabled={!isFormValid}
                onClick={handleSubmit}
                className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
                  isFormValid
                    ? "bg-[#FF7658] text-white"
                    : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
                }`}
              >
                제출하기
              </button>
            ) : (
              <button
                type="button"
                disabled={!isHistoryFormValid}
                onClick={handleHistoryConfirm}
                className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
                  isHistoryFormValid
                    ? "bg-[#FF7658] text-white"
                    : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
                }`}
              >
                확인
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
