const MATCHING_RESULT_PUBLISH_DELAY_HOURS = 2;

export function getMatchingResultPublishAt(applicationDeadlineAt?: string | null) {
  if (!applicationDeadlineAt) {
    return undefined;
  }

  const applicationDeadlineTime = new Date(applicationDeadlineAt).getTime();

  if (!Number.isFinite(applicationDeadlineTime)) {
    return undefined;
  }

  return new Date(
    applicationDeadlineTime + MATCHING_RESULT_PUBLISH_DELAY_HOURS * 60 * 60 * 1000,
  ).toISOString();
}
