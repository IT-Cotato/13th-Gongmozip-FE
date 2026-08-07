import TeamMatchingModalPreview from "@/components/team-matching/TeamMatchingModalPreview";

export default function ProfileRequiredModalPreviewPage() {
  return (
    <TeamMatchingModalPreview
      actions={[{ href: "/mypage/profile-management/new", label: "프로필 작성 바로가기" }]}
      fixedHeight="short"
      showCloseButton
      title={`AI 분석 매칭은\n프로필 작성이 완료되어야\n매칭 신청이 가능합니다.`}
    />
  );
}
