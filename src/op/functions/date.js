import { formatDate, formatUTCDate } from '../../util/format-date.js';
import { parseISODate } from '../../util/parse-iso-date.js';

const msMinute = 6e4;
const msDay = 864e5;
const msWeek = 6048e5;

const t0 = new Date();
const t1 = new Date();
const t = d => (
  t0.setTime(typeof d === 'string' ? parseISODate(d) : d),
  t0
);

/**
 * Returns an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted
 * string for the given *date* in local timezone. The resulting string is
 * compatible with *parse_date* and JavaScript's built-in *Date.parse*.
 * @param {Date | number} date The input Date or timestamp value.
 * @param {boolean} [shorten=false] A boolean flag (default `false`)
 *  indicating if the formatted string should be shortened if possible.
 *  For example, the local date `2001-01-01` will shorten from
 *  `"2001-01-01T00:00:00.000"` to `"2001-01-01T00:00"`.
 * @return {string} The formatted date string in local time.
 */
export function format_date(date, shorten) {
  return formatDate(t(date), !shorten);
}

/**
 * Returns an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted
 * string for the given *date* in Coordinated Universal Time (UTC). The
 * resulting string is compatible with *parse_date* and JavaScript's
 * built-in *Date.parse*.
 * @param {Date | number} date The input Date or timestamp value.
 * @param {boolean} [shorten=false] A boolean flag (default `false`)
 *  indicating if the formatted string should be shortened if possible.
 *  For example, the the UTC date `2001-01-01` will shorten from
 *  `"2001-01-01T00:00:00.000Z"` to `"2001-01-01"`
 * @return {string} The formatted date string in UTC time.
 */
export function format_utcdate(date, shorten){
  return formatUTCDate(t(date), !shorten);
}

/**
 * Returns the number of milliseconds elapsed since midnight, January 1,
 * 1970 Universal Coordinated Time (UTC).
 * @return {number} The timestamp for now.
 */
export function now() {
  return Date.now();
}

/**
 * Returns the timestamp for a *date* as the number of milliseconds elapsed
 * since January 1, 1970 00:00:00 UTC.
 * @param {Date | number} date The input Date value.
 * @return {number} The timestamp value.
 */
export function timestamp(date) {
  return +t(date);
}

/**
 * Creates and returns a new Date value. If no arguments are provided,
 * the current date and time are used.
 * @param {number} [year] The year.
 * @param {number} [month=0] The (zero-based) month.
 * @param {number} [date=1] The date within the month.
 * @param {number} [hours=0] The hour within the day.
 * @param {number} [minutes=0] The minute within the hour.
 * @param {number} [seconds=0] The second within the minute.
 * @param {number} [milliseconds=0] The milliseconds within the second.
 * @return {Date} The Date value.
 */
export function datetime(year, month, date, hours, minutes, seconds, milliseconds) {
  return !arguments.length
    ? new Date(Date.now())
    : new Date(
        year,
        month || 0,
        date == null ? 1 : date,
        hours || 0,
        minutes || 0,
        seconds || 0,
        milliseconds || 0
      );
}

/**
 * Returns the year of the specified *date* according to local time.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The year value in local time.
 */
export function year(date) {
  return t(date).getFullYear();
}

/**
 * Returns the zero-based quarter of the specified *date* according to
 * local time.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The quarter value in local time.
 */
export function quarter(date) {
  return Math.floor(t(date).getMonth() / 3);
}

/**
 * Returns the zero-based month of the specified *date* according to local
 * time. A value of `0` indicates January, `1` indicates February, and so on.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The month value in local time.
 */
export function month(date) {
  return t(date).getMonth();
}

/**
 * Returns the week number of the year (0-53) for the specified *date*
 * according to local time. By default, Sunday is used as the first day
 * of the week. All days in a new year preceding the first Sunday are
 * considered to be in week 0.
 * @param {Date | number} date The input Date or timestamp value.
 * @param {number} firstday The number of first day of the week (default
 *  `0` for Sunday, `1` for Monday and so on).
 * @return {number} The week of the year in local time.
 */
export function week(date, firstday) {
  const i = firstday || 0;
  t1.setTime(+date);
  t1.setDate(t1.getDate() - (t1.getDay() + 7 - i) % 7);
  t1.setHours(0, 0, 0, 0);
  t0.setTime(+date);
  t0.setMonth(0);
  t0.setDate(1);
  t0.setDate(1 - (t0.getDay() + 7 - i) % 7);
  t0.setHours(0, 0, 0, 0);
  const tz = (t1.getTimezoneOffset() - t0.getTimezoneOffset()) * msMinute;
  return Math.floor((1 + (+t1 - +t0) - tz) / msWeek);
}

/**
 * Returns the date (day of month) of the specified *date* according
 * to local time.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The date (day of month) value.
 */
export function date(date) {
  return t(date).getDate();
}

/**
 * Returns the day of the year (1-366) of the specified *date* according
 * to local time.
 * @param {Date | number} date A date or timestamp.
 * @return {number} The day of the year in local time.
 */
export function dayofyear(date) {
  t1.setTime(+date);
  t1.setHours(0, 0, 0, 0);
  t0.setTime(+t1);
  t0.setMonth(0);
  t0.setDate(1);
  const tz = (t1.getTimezoneOffset() - t0.getTimezoneOffset()) * msMinute;
  return Math.floor(1 + ((+t1 - +t0) - tz) / msDay);
}

/**
 * Returns the Sunday-based day of the week (0-6) of the specified *date*
 * according to local time. A value of `0` indicates Sunday, `1` indicates
 * Monday, and so on.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The day of the week value in local time.
 */
export function dayofweek(date) {
  return t(date).getDay();
}

/**
 * Returns the hour of the day for the specified *date* according
 * to local time.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The hour value in local time.
 */
export function hours(date) {
  return t(date).getHours();
}

/**
 * Returns the minute of the hour for the specified *date* according
 * to local time.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The minutes value in local time.
 */
export function minutes(date) {
  return t(date).getMinutes();
}

/**
 * Returns the seconds of the minute for the specified *date* according
 * to local time.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The seconds value in local time.
 */
export function seconds(date) {
  return t(date).getSeconds();
}

/**
 * Returns the milliseconds of the second for the specified *date* according
 * to local time.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The milliseconds value in local time.
 */
export function milliseconds(date) {
  return t(date).getMilliseconds();
}

/**
 * Creates and returns a new Date value using Coordinated Universal Time
 * (UTC). If no arguments are provided, the current date and time are used.
 * @param {number} [year] The year.
 * @param {number} [month=0] The (zero-based) month.
 * @param {number} [date=1] The date within the month.
 * @param {number} [hours=0] The hour within the day.
 * @param {number} [minutes=0] The minute within the hour.
 * @param {number} [seconds=0] The second within the minute.
 * @param {number} [milliseconds=0] The milliseconds within the second.
 * @return {Date} The Date value.
 */
export function utcdatetime(year, month, date, hours, minutes, seconds, milliseconds) {
  return !arguments.length
    ? new Date(Date.now())
    : new Date(Date.UTC(
        year,
        month || 0,
        date == null ? 1 : date,
        hours || 0,
        minutes || 0,
        seconds || 0,
        milliseconds || 0
      ));
}

/**
 * Returns the year of the specified *date* according to Coordinated
 * Universal Time (UTC).
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The year value in UTC time.
 */
export function utcyear(date) {
  return t(date).getUTCFullYear();
}

/**
 * Returns the zero-based quarter of the specified *date* according to
 * Coordinated Universal Time (UTC)
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The quarter value in UTC time.
 */
export function utcquarter(date) {
  return Math.floor(t(date).getUTCMonth() / 3);
}

/**
 * Returns the zero-based month of the specified *date* according to
 * Coordinated Universal Time (UTC). A value of `0` indicates January,
 * `1` indicates February, and so on.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The month value in UTC time.
 */
export function utcmonth(date) {
  return t(date).getUTCMonth();
}

/**
 * Returns the week number of the year (0-53) for the specified *date*
 * according to Coordinated Universal Time (UTC). By default, Sunday is
 * used as the first day of the week. All days in a new year preceding the
 * first Sunday are considered to be in week 0.
 * @param {Date | number} date The input Date or timestamp value.
 * @param {number} firstday The number of first day of the week (default
 *  `0` for Sunday, `1` for Monday and so on).
 * @return {number} The week of the year in UTC time.
 */
export function utcweek(date, firstday) {
  const i = firstday || 0;
  t1.setTime(+date);
  t1.setUTCDate(t1.getUTCDate() - (t1.getUTCDay() + 7 - i) % 7);
  t1.setUTCHours(0, 0, 0, 0);
  t0.setTime(+date);
  t0.setUTCMonth(0);
  t0.setUTCDate(1);
  t0.setUTCDate(1 - (t0.getUTCDay() + 7 - i) % 7);
  t0.setUTCHours(0, 0, 0, 0);
  return Math.floor((1 + (+t1 - +t0)) / msWeek);
}

/**
 * Returns the date (day of month) of the specified *date* according to
 * Coordinated Universal Time (UTC).
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The date (day of month) value in UTC time.
 */
export function utcdate(date) {
  return t(date).getUTCDate();
}

/**
 * Returns the day of the year (1-366) of the specified *date* according
 * to Coordinated Universal Time (UTC).
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The day of the year in UTC time.
 */
export function utcdayofyear(date) {
  t1.setTime(+date);
  t1.setUTCHours(0, 0, 0, 0);
  const t0 = Date.UTC(t1.getUTCFullYear(), 0, 1);
  return Math.floor(1 + (+t1 - t0) / msDay);
}

/**
 * Returns the Sunday-based day of the week (0-6) of the specified *date*
 * according to Coordinated Universal Time (UTC). A value of `0` indicates
 * Sunday, `1` indicates Monday, and so on.
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The day of the week in UTC time.
 */
export function utcdayofweek(date) {
  return t(date).getUTCDay();
}

/**
 * Returns the hour of the day for the specified *date* according to
 * Coordinated Universal Time (UTC).
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The hours value in UTC time.
 */
export function utchours(date) {
  return t(date).getUTCHours();
}

/**
 * Returns the minute of the hour for the specified *date* according to
 * Coordinated Universal Time (UTC).
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The minutes value in UTC time.
 */
export function utcminutes(date) {
  return t(date).getUTCMinutes();
}

/**
 * Returns the seconds of the minute for the specified *date* according to
 * Coordinated Universal Time (UTC).
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The seconds value in UTC time.
 */
export function utcseconds(date) {
  return t(date).getUTCSeconds();
}

/**
 * Returns the milliseconds of the second for the specified *date* according to
 * Coordinated Universal Time (UTC).
 * @param {Date | number} date The input Date or timestamp value.
 * @return {number} The milliseconds value in UTC time.
 */
export function utcmilliseconds(date) {
  return t(date).getUTCMilliseconds();
}
