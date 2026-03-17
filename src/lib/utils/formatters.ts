const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < MINUTE) return "just now";
  if (seconds < HOUR) {
    const m = Math.floor(seconds / MINUTE);
    return `${m}m ago`;
  }
  if (seconds < DAY) {
    const h = Math.floor(seconds / HOUR);
    return `${h}h ago`;
  }
  if (seconds < WEEK) {
    const d = Math.floor(seconds / DAY);
    return `${d}d ago`;
  }
  return new Date(then).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatWeekLabel(weekYear: string): string {
  const match = weekYear.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekYear;
  return `Week ${parseInt(match[2], 10)}, ${match[1]}`;
}

export function formatVoteCount(count: number): string {
  if (count < 1000) return count.toString();
  return `${(count / 1000).toFixed(1)}k`;
}
