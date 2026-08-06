import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

type PresignedUrlResponse = {
  uploadUrl: string;
  imageUrl: string;
  contentType: string;
};

async function uploadProfileImage(file: File) {
  const { uploadUrl, imageUrl, contentType } = await apiFetch<PresignedUrlResponse>(
    "/api/members/me/profile-image/presigned-url",
    {
      method: "POST",
      body: { fileName: file.name, contentType: file.type },
    },
  );

  // presigned URL은 S3로 직접 올리는 요청이라 우리 백엔드 인증 헤더를 붙이면 안 됨
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("이미지 업로드에 실패했어요.");
  }

  await apiFetch<void>("/api/members/me/profile-image", {
    method: "PATCH",
    body: { profileImageUrl: imageUrl },
  });

  return imageUrl;
}

export function useUpdateProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: () => {
      // invalidateQueries는 키 접두사로 매칭되므로, 세션별로 뒤에 accessToken이
      // 붙는 실제 쿼리키(memberProfileQueryKey)까지 그대로 무효화된다.
      queryClient.invalidateQueries({ queryKey: ["member", "profile"] });
    },
  });
}
