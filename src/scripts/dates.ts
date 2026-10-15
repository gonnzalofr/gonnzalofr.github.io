// Date formatting for the bench log. Dates are stored as calendar days in the front matter,
// so they are read back in UTC to keep the day from shifting with the build machine's zone.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "19 June 2026" */
export function longDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2026-06-19", for <time datetime> */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
