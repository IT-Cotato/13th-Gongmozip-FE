import { ProfilePreviewContent } from "./_components/ProfilePreviewContent";

type ProfilePreviewPageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export default async function ProfilePreviewPage({ params }: ProfilePreviewPageProps) {
  const { profileId } = await params;

  return <ProfilePreviewContent profileId={profileId} />;
}
