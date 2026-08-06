import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type CollaborationTypeTestStatus = {
  isCompleted: boolean;
};

function fetchCollaborationTypeTestStatus() {
  return apiFetch<CollaborationTypeTestStatus>("/api/members/me/collaboration-type-test/status");
}

// TODO(backend): 협업 유형 검사 진행 여부 API 연동 전까지 아직 어디서도 사용되지 않음.
// 연동 시 마이페이지에서 이 훅으로 status.isCompleted를 읽어 캐릭터 관리 아이콘 클릭 분기에 사용할 것.
export function useCollaborationTypeTestStatusQuery() {
  return useQuery({
    queryKey: ["member", "collaboration-type-test", "status"],
    queryFn: fetchCollaborationTypeTestStatus,
  });
}
