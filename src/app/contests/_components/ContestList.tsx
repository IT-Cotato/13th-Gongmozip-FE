import type { ContestSummary } from "../_types";

type ContestListProps = {
  contests: ContestSummary[];
};

export function ContestList({ contests }: ContestListProps) {
  return (
    <section aria-label="공모전 목록">
      {contests.map((contest) => (
        <article key={contest.id}>
          <h2>{contest.title}</h2>
          <p>{contest.organizer}</p>
        </article>
      ))}
    </section>
  );
}
