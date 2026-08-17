import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  memberProfileQueryKey,
  type MemberGender,
  type MemberProfile,
} from "./useMemberProfileQuery";

export type UpdateMemberProfileRequest = {
  name: string;
  gender: MemberGender;
  birthDate: string;
};

function updateMemberProfile(payload: UpdateMemberProfileRequest) {
  return apiFetch<void>("/api/members/me", {
    method: "PATCH",
    body: payload,
  });
}

export function useUpdateMemberProfileMutation() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: updateMemberProfile,
    onSuccess: (_data, payload) => {
      // 백엔드는 성공해도 응답 바디가 비어있는(BaseResponseVoid) 엔드포인트라,
      // 응답으로 캐시를 덮어쓰면 프로필이 통째로 사라진다. 보낸 값을 그대로 병합한다.
      queryClient.setQueryData<MemberProfile>(memberProfileQueryKey(accessToken), (current) =>
        current ? { ...current, ...payload } : current,
      );
    },
  });
}
