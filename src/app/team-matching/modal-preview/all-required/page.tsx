import TeamMatchingModalPreview from "@/components/team-matching/TeamMatchingModalPreview";

export default function AllRequiredModalPreviewPage() {
  return (
    <TeamMatchingModalPreview
      actions={[
        { href: "/team-matching/profile", label: "프로필 작성 바로가기", variant: "outline" },
        {
          href: "/mypage/collaboration-type-test",
          label: "협업 유형 검사 바로가기",
        },
      ]}
      showCloseButton
      title={`AI 분석 매칭은\n프로필 작성과 협업 유형 검사가\n완료되어야 신청 가능합니다.`}
    />
  );
}
