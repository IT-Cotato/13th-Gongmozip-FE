"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "./_components/icons";
import { Toggle } from "./_components/Toggle";
import { useMemberProfileQuery } from "@/queries/useMemberProfileQuery";
import { useUpdateMarketingConsentMutation } from "@/queries/useUpdateMarketingConsentMutation";

export default function SettingsPage() {
  const router = useRouter();
  const { data: profile, isLoading, isError, refetch } = useMemberProfileQuery();
  const updateConsentMutation = useUpdateMarketingConsentMutation();

  function handleToggle(field: "marketingConsentEmail" | "marketingConsentSms") {
    if (!profile || updateConsentMutation.isPending) return;

    updateConsentMutation.mutate({
      marketingConsentEmail: profile.marketingConsentEmail,
      marketingConsentSms: profile.marketingConsentSms,
      [field]: !profile[field],
    });
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex items-center justify-center px-4 py-1">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">서비스 설정</h1>
      </div>

      {isLoading && (
        <p className="px-4 py-10 text-center text-[13px] text-[#949494]">
          설정을 불러오는 중이에요...
        </p>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 px-4 py-10">
          <p className="text-[13px] text-[#949494]">설정을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
          >
            다시 시도
          </button>
        </div>
      )}

      {profile && (
        <div className="flex w-full flex-col items-start px-4">
          <div className="flex w-full flex-col gap-4 border-b border-[rgba(97,97,97,0.16)] pt-6 pb-4">
            <p className="text-xs leading-[1.35] font-semibold text-[#949494]">기타설정</p>
            <div className="flex w-full flex-col gap-4 px-2">
              <div className="flex w-full items-start justify-between">
                <p className="text-[15px] leading-[1.25] font-medium text-[#1F1F1F]">
                  Email 마케팅 수신 동의
                </p>
                <Toggle
                  checked={profile.marketingConsentEmail}
                  onChange={() => handleToggle("marketingConsentEmail")}
                  label="Email 마케팅 수신 동의"
                  disabled={updateConsentMutation.isPending}
                />
              </div>
              <div className="flex w-full items-start justify-between">
                <p className="text-[15px] leading-[1.25] font-medium text-[#1F1F1F]">
                  SMS 마케팅 수신 동의
                </p>
                <Toggle
                  checked={profile.marketingConsentSms}
                  onChange={() => handleToggle("marketingConsentSms")}
                  label="SMS 마케팅 수신 동의"
                  disabled={updateConsentMutation.isPending}
                />
              </div>
              {updateConsentMutation.isError && (
                <p role="alert" className="px-1 text-xs leading-[1.35] text-[#BB5260]">
                  수신 동의 설정을 저장하지 못했어요. 다시 시도해주세요.
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-start border-b border-[rgba(97,97,97,0.16)] pt-6 pb-4">
            <div className="flex w-full flex-col items-start px-2">
              <Link
                href="/mypage/settings/withdraw"
                className="w-full text-left text-[15px] leading-[1.25] font-medium text-[#1F1F1F]"
              >
                회원 탈퇴
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
