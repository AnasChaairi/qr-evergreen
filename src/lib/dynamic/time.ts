// Date helpers for the dashboard, kept out of components so renders stay pure.

export function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * 86400_000);
}

// The last `count` UTC dates as YYYY-MM-DD, oldest first, ending today.
export function lastDays(count: number, now = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => daysAgo(count - 1 - i, now).toISOString().slice(0, 10));
}
