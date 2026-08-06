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
  return apiFetch<MemberProfile>("/api/members/me", {
    method: "PATCH",
    body: payload,
  });
}

export function useUpdateMemberProfileMutation() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: updateMemberProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(memberProfileQueryKey(accessToken), data);
    },
  });
}
