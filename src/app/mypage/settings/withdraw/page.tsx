"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, ChevronLeftIcon } from "./_components/icons";
import { WithdrawReasonSheet } from "./_components/WithdrawReasonSheet";

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

function ConsentCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label="탈퇴 안내 사항 확인 동의"
      className="shrink-0"
    >
      {checked ? (
        <img src="/images/check-circle.svg" alt="" className="size-8" />
      ) : (
        <span className="block size-8 rounded-full border-2 border-gray-300" />
      )}
    </button>
  );
}

export default function WithdrawPage() {
  const router = useRouter();
  // TODO(backend): 비밀번호 검증 API 연동 전까지 목업으로 임시 표시
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isReasonSheetOpen, setIsReasonSheetOpen] = useState(false);

  const isFormValid = password.trim().length > 0 && reason.length > 0 && agreed;

  function handleWithdraw() {
    if (!isFormValid) return;
    // TODO(backend): 회원 탈퇴 API 연동
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="relative flex items-center justify-center px-4 py-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로가기"
            className="absolute left-4 flex h-6 w-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">회원 탈퇴</h1>
        </div>

        <div className="px-6 py-[22px]">
          <p className="text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
            공모집(gongmo.zip)에서
            <br />
            탈퇴하시나요?
            <br />
            너무 아쉬워요
          </p>
        </div>

        <div className="flex justify-center py-2">
          <img src="/images/goodByeCharacter.svg" alt="" className="size-[235px]" />
        </div>

        <div className="px-4 pb-2">
          <div className="flex flex-col gap-[10px] rounded-[14px] bg-[#F5F5F5] px-4 py-2">
            <p className="border-b border-[rgba(97,97,97,0.22)] p-2 text-[15px] leading-[1.25] font-medium text-[#1F1F1F]">
              탈퇴 전 확인해주세요.
            </p>
            <ul className="flex flex-col gap-1.5 p-2 text-[13px] leading-[1.5] text-[#616161]">
              <li className="list-disc ms-[19.5px]">
                회원을 탈퇴하시면 이용중인 모든 활동 정보가 삭제되며, 복구가 불가능합니다
              </li>
              <li className="list-disc ms-[19.5px]">계정 삭제 후 14일동안 재가입이 제한됩니다.</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">비밀번호 입력</span>
            <span className="text-[#FF7658]">*</span>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력해 주세요."
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">탈퇴 사유</span>
          </div>
          <button
            type="button"
            onClick={() => setIsReasonSheetOpen(true)}
            className={`flex h-11 w-full items-center justify-between rounded-xl border border-[rgba(97,97,97,0.08)] bg-[rgba(255,255,255,0.08)] px-5 py-3 text-left text-[13px] leading-[1.5] ${
              reason ? "text-[#1F1F1F]" : "text-[#949494]"
            }`}
          >
            <span className="truncate">{reason || "사유를 선택해주세요."}</span>
            <ChevronDownIcon className="shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-2">
          <ConsentCheckbox checked={agreed} onToggle={() => setAgreed((v) => !v)} />
          <p className="flex-1 text-[13px] leading-[1.5] text-[#1F1F1F]">
            위 안내 사항을 모두 확인하였으며, 이에 동의합니다.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleWithdraw}
          className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
            isFormValid
              ? "bg-[#FF7658] text-white"
              : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
          }`}
        >
          회원 탈퇴
        </button>
      </div>

      {isReasonSheetOpen && (
        <WithdrawReasonSheet
          onSelect={(selected) => {
            setReason(selected);
            setIsReasonSheetOpen(false);
          }}
          onClose={() => setIsReasonSheetOpen(false)}
        />
      )}
    </div>
  );
}
