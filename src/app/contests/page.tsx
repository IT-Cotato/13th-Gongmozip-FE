import BottomNavigation from "@/components/layout/BottomNavigation";

import { ContestCategorySheet } from "./_components/ContestCategorySheet";
import { ContestList } from "./_components/ContestList";
import { MOCK_CONTESTS } from "./_data/mockContests";

export default function ContestsPage() {
  return (
    <main>
      <h1>공모전 정보</h1>
      <ContestCategorySheet />
      <ContestList contests={MOCK_CONTESTS} />
      <BottomNavigation />
    </main>
  );
}
