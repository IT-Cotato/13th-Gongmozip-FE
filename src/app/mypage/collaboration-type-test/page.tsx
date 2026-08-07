import { redirect } from "next/navigation";

export default function MypageCollaborationTypeTestPage() {
  redirect("/collaboration-type?returnTo=/mypage");
}
