function pad(value: number) {
  return String(value).padStart(2, "0");
}

// 백엔드가 createdAt/answeredAt을 타임존 표시 없는 UTC 문자열로 내려줘서
// (예: "2026-08-06T13:36:22"), "Z"가 없으면 브라우저가 이를 로컬 시간으로
// 오인해 실제 시각보다 9시간 이르게 표시하는 문제가 있었음. 오프셋이 없을
// 때만 UTC로 명시해 파싱한다.
const HAS_TIMEZONE_REGEX = /(Z|[+-]\d{2}:?\d{2})$/;

export function formatContactDate(isoDateTime: string) {
  const normalized = HAS_TIMEZONE_REGEX.test(isoDateTime) ? isoDateTime : `${isoDateTime}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };

  return {
    date: `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  };
}
