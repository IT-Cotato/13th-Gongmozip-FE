import { ScrapList } from "../_components/ScrapList";
import { MOCK_CONTESTS } from "../_data/mockContests";

export default function ContestScrapsPage() {
  return (
    <main>
      <h1>스크랩</h1>
      <ScrapList contests={MOCK_CONTESTS.filter((contest) => contest.isScrapped)} />
    </main>
  );
}
