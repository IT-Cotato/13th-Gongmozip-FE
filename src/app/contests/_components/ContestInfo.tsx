import type { ContestDetail } from "../_types";

type ContestInfoProps = {
  contest: ContestDetail;
};

export function ContestInfo({ contest }: ContestInfoProps) {
  return (
    <section aria-label="공모전 정보">
      <p>{contest.category}</p>
      <h2>{contest.title}</h2>
      <p>{contest.organizer}</p>
      <dl>
        <dt>접수기간</dt>
        <dd>{contest.applicationPeriod}</dd>
        <dt>공모전 분야</dt>
        <dd>{contest.category}</dd>
        <dt>지원자격</dt>
        <dd>{contest.eligibility}</dd>
        <dt>시상내역</dt>
        <dd>{contest.prize}</dd>
        <dt>공모전 내용</dt>
        <dd>{contest.description}</dd>
      </dl>
    </section>
  );
}
