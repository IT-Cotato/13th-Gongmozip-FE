const MATCHING_RESULT_PUBLISH_DELAY_HOURS = 2;
const MATCHING_APPLICATION_CLOSED_START_HOUR = 14;
const MATCHING_APPLICATION_CLOSED_END_HOUR = 16;

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

export function isMatchingApplicationClosedTime(date = new Date()) {
  const hour = date.getHours();

  return (
    hour >= MATCHING_APPLICATION_CLOSED_START_HOUR &&
    hour < MATCHING_APPLICATION_CLOSED_END_HOUR
  );
}
