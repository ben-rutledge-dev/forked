/**
 * Format a Date as a short day label: "Mon 9 Jun".
 * Uses Intl.DateTimeFormat so day/month names respect the user's locale.
 *
 * @param date - The date to format.
 * @param utc  - When true, reads UTC fields (use for dates constructed from ISO strings).
 */
export const formatDayLabel = (date: Date, utc = false): string => {
  const timeZone = utc ? 'UTC' : undefined;
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone }).format(date);
  const day = utc ? date.getUTCDate() : date.getDate();
  const month = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone }).format(date);
  return `${weekday} ${day} ${month}`;
};

/**
 * Convenience wrapper for YYYY-MM-DD strings — constructs a UTC Date and calls formatDayLabel.
 */
export const formatDateStrLabel = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return formatDayLabel(new Date(Date.UTC(y, m - 1, d)), true);
};

/**
 * Format a week range as "9–15 Jun" or "30 Jun–6 Jul" when the range spans months.
 */
export const formatWeekRange = (startDateStr: string, endDateStr: string): string => {
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ey, em, ed] = endDateStr.split('-').map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, sd));
  const end = new Date(Date.UTC(ey, em - 1, ed));
  const startMonth = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(start);
  const endMonth = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(end);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  if (startMonth === endMonth) return `${startDay}–${endDay} ${endMonth}`;
  return `${startDay} ${startMonth}–${endDay} ${endMonth}`;
};

/** Format a Date as a YYYY-MM-DD string using local time fields. */
export const toDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

/** Return today's date as a YYYY-MM-DD string. */
export const todayStr = (): string => toDateStr(new Date());

/** Add (or subtract) days to a YYYY-MM-DD string using UTC arithmetic. */
export const addDays = (dateStr: string, days: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().split('T')[0];
};

/** Return the Monday of the week containing the given YYYY-MM-DD string. */
export const startOfWeek = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return addDays(dateStr, dow === 0 ? -6 : 1 - dow);
};
