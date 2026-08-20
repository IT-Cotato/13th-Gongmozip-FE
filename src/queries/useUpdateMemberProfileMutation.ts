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

  return useMutation({
    mutationFn: updateMemberProfile,
    onSuccess: (_data, payload) => {
      // 백엔드는 성공해도 응답 바디가 비어있는(BaseResponseVoid) 엔드포인트라,
      // 응답으로 캐시를 덮어쓰면 프로필이 통째로 사라진다. 보낸 값을 그대로 병합한다.
      // accessToken은 렌더 시점 클로저가 아니라 mutate 완료 시점의 최신 값을 읽어야
      // 한다 - 요청이 떠 있는 동안 토큰이 재발급되면 클로저 값은 이미 낡은 캐시 키를
      // 가리키게 된다. current가 없는(즉 현재 활성 캐시가 아닌) 키에는 병합하지 않으므로
      // 다른 계정으로 전환된 경우에도 그 계정 캐시를 오염시키지 않는다.
      const accessToken = useAuthStore.getState().accessToken;
      queryClient.setQueryData<MemberProfile>(memberProfileQueryKey(accessToken), (current) =>
        current ? { ...current, ...payload } : current,
      );
    },
  });
}
