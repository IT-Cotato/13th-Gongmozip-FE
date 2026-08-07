import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";
import { profileListQueryKey, type ProfileListResponse } from "./useProfileListQuery";
import { profilePreviewQueryKey, type ProfilePreview } from "./useProfilePreviewQuery";

export type UpdateProfileVisibilityRequest = {
  profileId: string;
  isPublic: boolean;
};

function updateProfileVisibility({ profileId, isPublic }: UpdateProfileVisibilityRequest) {
  return apiFetch<void>(`/api/profiles/${encodeURIComponent(profileId)}/visibility`, {
    method: "PATCH",
    body: { isPublic },
  });
}

export function useUpdateProfileVisibilityMutation() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: updateProfileVisibility,
    onSuccess: (_data, { profileId, isPublic }) => {
      queryClient.setQueryData<ProfileListResponse>(profileListQueryKey(accessToken), (current) =>
        current
          ? {
              ...current,
              profiles: current.profiles.map((profile) =>
                String(profile.profileId) === profileId ? { ...profile, isPublic } : profile,
              ),
            }
          : current,
      );
      queryClient.setQueryData<ProfilePreview>(profilePreviewQueryKey(profileId), (current) =>
        current ? { ...current, isPublic } : current,
      );
    },
  });
}
