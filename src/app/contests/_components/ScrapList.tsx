import type { ContestSummary } from "../_types";

type ScrapListProps = {
  contests: ContestSummary[];
};

export function ScrapList({ contests }: ScrapListProps) {
  return (
    <section aria-label="스크랩한 공모전">
      <h2>스크랩한 공모전</h2>
      {contests.map((contest) => (
        <article key={contest.id}>
          <h3>{contest.title}</h3>
          <p>{contest.organizer}</p>
        </article>
      ))}
    </section>
  );
}
