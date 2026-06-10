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
