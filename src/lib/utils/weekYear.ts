/**
 * ISO week calculation utilities — all in AEST (Australia/Sydney).
 * Week starts Monday, ends Sunday 23:59:59 AEST.
 */

function getISOWeekString(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

/** Returns the current ISO week string (e.g., '2026-W11') in AEST. */
export function getCurrentWeekYear(): string {
  const aestNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" })
  );
  return getISOWeekString(aestNow);
}

/** Converts any date to its ISO week string in AEST. */
export function dateToWeekYear(date: Date): string {
  const aestDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Australia/Sydney" })
  );
  return getISOWeekString(aestDate);
}
