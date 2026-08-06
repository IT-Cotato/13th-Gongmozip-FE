export function formatYearMonth(isoDate: string) {
  const match = /^(\d{4})-(\d{2})/.exec(isoDate);
  if (!match) return "";
  const [, year, month] = match;
  return `${year}.${month}`;
}
