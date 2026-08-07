"use client";

import Image from "next/image";
import { Suspense, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon } from "../../_components/icons";
import { ContactStatusBadge } from "../../_components/ContactStatusBadge";
import { formatContactDate } from "../../_lib/date";
import { useInquiryDetailQuery } from "@/queries/useInquiryDetailQuery";
import { useContactInquiryAuthStore } from "@/stores/contactInquiryAuthStore";

const DEFAULT_RETURN_TO = "/contact?tab=history&step=list";
const VERIFY_AGAIN_URL = "/contact?tab=history&step=verify";

const READONLY_BOX_CLASS =
  "w-full rounded-xl border border-[rgba(97,97,97,0.08)] bg-white px-5 py-3 text-[13px] leading-[1.5] whitespace-pre-wrap text-[#1F1F1F]";

export default function ContactHistoryDetailPage() {
  return (
    <Suspense fallback={null}>
      <ContactHistoryDetailPageInner />
    </Suspense>
  );
}

function isSafeReturnPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

function ContactHistoryDetailPageInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo = rawReturnTo && isSafeReturnPath(rawReturnTo) ? rawReturnTo : DEFAULT_RETURN_TO;

  const email = useContactInquiryAuthStore((state) => state.email);
  const password = useContactInquiryAuthStore((state) => state.password);
  const auth = email && password ? { email, password } : null;

  const detailQuery = useInquiryDetailQuery(params.id, auth);
  const item = detailQuery.data;

  useEffect(() => {
    if (!email || !password) {
      router.replace(VERIFY_AGAIN_URL);
    }
  }, [email, password, router]);

  function handleBack() {
    router.push(returnTo);
  }

  const createdAt = item ? formatContactDate(item.createdAt) : null;
  const answeredAt = item?.answeredAt ? formatContactDate(item.answeredAt) : null;

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
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">문의내용</h1>
      </div>

      {!auth || detailQuery.isLoading ? (
        <p className="p-4 text-center text-[13px] leading-[1.5] text-[#616161]">
          문의 내역을 불러오는 중이에요...
        </p>
      ) : detailQuery.isError || !item || !createdAt ? (
        <p className="p-4 text-center text-[13px] leading-[1.5] text-[#616161]">
          문의 내역을 찾을 수 없습니다.
        </p>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="flex w-full flex-col items-start border-b-4 border-[rgba(97,97,97,0.08)] py-4">
            <div className="flex w-full items-center justify-between gap-2 px-5">
              <ContactStatusBadge status={item.status} />
              <div className="flex items-center gap-2 text-[13px] leading-[1.35] font-medium whitespace-nowrap text-[#949494]">
                <span>작성일</span>
                <span>{createdAt.date}</span>
                <span>{createdAt.time}</span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 p-4">
              <p className="px-2 text-[17px] leading-[1.35] font-medium text-[#1F1F1F]">
                {item.title}
              </p>
              <p className={READONLY_BOX_CLASS}>{item.content}</p>
            </div>

            <div className="flex w-full flex-col gap-1 p-4">
              <p className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]">이메일</p>
              <p className={READONLY_BOX_CLASS}>{item.email}</p>
            </div>
          </div>

          {item.answerContent && answeredAt && (
            <div className="flex w-full flex-col gap-3 p-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/contact/customorCenterRobot.svg"
                  alt=""
                  height={60}
                  width={60}
                  className="size-[60px] shrink-0 rounded-full bg-[#EBF7FE]"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-[15px] leading-[1.25] font-semibold text-[#1F1F1F]">
                    공모집 고객센터
                  </p>
                  <div className="flex items-center gap-2 text-[13px] leading-[1.35] font-medium whitespace-nowrap text-[#949494]">
                    <span>답변일</span>
                    <span>{answeredAt.date}</span>
                    <span>{answeredAt.time}</span>
                  </div>
                </div>
              </div>
              <p className={READONLY_BOX_CLASS}>{item.answerContent}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
