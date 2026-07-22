import { ContestInfo } from "../_components/ContestInfo";
import { SendCandidateSheet } from "../_components/SendCandidateSheet";
import { ShareContestModal } from "../_components/ShareContestModal";
import { ScrapContestModal } from "../_components/ScrapContestModal";
import { MOCK_CONTESTS } from "../_data/mockContests";

type ContestDetailPageProps = {
  params: Promise<{
    contestId: string;
  }>;
};

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
  const { contestId } = await params;
  const contest = MOCK_CONTESTS.find((item) => item.id === contestId) ?? MOCK_CONTESTS[0];

  return (
    <main>
      <h1>상세정보</h1>
      <ContestInfo contest={contest} />
      <ShareContestModal />
      <ScrapContestModal />
      <SendCandidateSheet />
    </main>
  );
}
