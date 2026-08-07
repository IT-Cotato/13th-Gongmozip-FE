import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";
import { memberProfileQueryKey, type MemberProfile } from "./useMemberProfileQuery";

export type UpdateMarketingConsentRequest = {
  marketingConsentEmail: boolean;
  marketingConsentSms: boolean;
};

function updateMarketingConsent(payload: UpdateMarketingConsentRequest) {
  return apiFetch<void>("/api/members/me/marketing-consents", {
    method: "PATCH",
    body: payload,
  });
}

export function useUpdateMarketingConsentMutation() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: updateMarketingConsent,
    onSuccess: (_data, payload) => {
      queryClient.setQueryData<MemberProfile>(memberProfileQueryKey(accessToken), (current) =>
        current ? { ...current, ...payload } : current,
      );
    },
  });
}
