import Link from "next/link";

const modalPreviewRoutes = [
  { href: "/team-matching/modal-preview/weekly-limit", label: "1. 매칭 참여 제한" },
  { href: "/team-matching/modal-preview/already-applied", label: "2. 이미 신청 완료" },
  { href: "/team-matching/modal-preview/profile-required", label: "3. 프로필 작성 필요" },
  {
    href: "/team-matching/modal-preview/collaboration-test-required",
    label: "4. 협업 유형 검사 필요",
  },
  { href: "/team-matching/modal-preview/all-required", label: "5. 프로필/협업 유형 검사 필요" },
];

export default function TeamMatchingModalPreviewIndexPage() {
  return (
    <main className="flex h-full w-full flex-col bg-white px-5 py-8 text-[#1F1F1F]">
      <h1 className="font-[Pretendard] text-[22px] font-bold leading-[135%]">
        팀원 매칭 모달 미리보기
      </h1>

      <div className="mt-6 flex flex-col gap-3">
        {modalPreviewRoutes.map((route) => (
          <Link
            className="flex h-12 items-center rounded-[14px] bg-[#F5F5F5] px-4 font-[Pretendard] text-[15px] font-semibold leading-[135%] text-[#1F1F1F]"
            href={route.href}
            key={route.href}
          >
            {route.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
