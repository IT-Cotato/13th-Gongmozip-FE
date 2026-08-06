import TeamMatchingModalPreview from "@/components/team-matching/TeamMatchingModalPreview";

export default function CollaborationTestRequiredModalPreviewPage() {
  return (
    <TeamMatchingModalPreview
      actions={[
        {
          href: "/mypage/collaboration-type-test",
          label: "협업 유형 검사 바로가기",
        },
      ]}
      showCloseButton
      title={`AI 분석 매칭은\n협업 유형 검사가 완료되어야\n매칭 신청이 가능합니다.`}
    />
  );
}
