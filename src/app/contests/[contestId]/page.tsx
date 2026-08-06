import { ContestDetailContent } from "./_components/ContestDetailContent";

type ContestDetailPageProps = {
  params: Promise<{
    contestId: string;
  }>;
};

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
  const { contestId } = await params;

  return <ContestDetailContent contestId={contestId} />;
}
