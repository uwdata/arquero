import { formatDate, formatUTCDate } from '../../util/format-date.js';
import parseIsoDate from '../../util/parse-iso-date.js';

const msMinute = 6e4;
const msDay = 864e5;
const msWeek = 6048e5;

const t0 = new Date();
const t1 = new Date();
const t = d => (
  t0.setTime(typeof d === 'string' ? parseIsoDate(d) : d),
  t0
);

/**
 * Function to create a new Date value.
 * If no arguments are provided, the current time is used.
 * @param {number} [year] The year.
 * @param {number} [month=0] The (zero-based) month.
 * @param {number} [date=1] The date within the month.
 * @param {number} [hours=0] The hour within the day.
 * @param {number} [minutes=0] The minute within the hour.
 * @param {number} [seconds=0] The second within the minute.
 * @param {number} [milliseconds=0] The milliseconds within the second.
 * @return {Date} The resuting Date value.
 */
function datetime(year, month, date, hours, minutes, seconds, milliseconds) {
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
 * Function to create a new Date value according to UTC time.
 * If no arguments are provided, the current time is used.
 * @param {number} [year] The year.
 * @param {number} [month=0] The (zero-based) month.
 * @param {number} [date=1] The date within the month.
 * @param {number} [hours=0] The hour within the day.
 * @param {number} [minutes=0] The minute within the hour.
 * @param {number} [seconds=0] The second within the minute.
 * @param {number} [milliseconds=0] The milliseconds within the second.
 * @return {Date} The resuting Date value.
 */
function utcdatetime(year, month, date, hours, minutes, seconds, milliseconds) {
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
 * Return the current day of the year in local time as a number
 * between 1 and 366.
 * @param {Date|number} date A date or timestamp.
 * @return {number} The day of the year in local time.
 */
function dayofyear(date) {
  t1.setTime(+date);
  t1.setHours(0, 0, 0, 0);
  t0.setTime(+t1);
  t0.setMonth(0);
  t0.setDate(1);
  const tz = (t1.getTimezoneOffset() - t0.getTimezoneOffset()) * msMinute;
  return Math.floor(1 + ((+t1 - +t0) - tz) / msDay);
}

/**
 * Return the current day of the year in UTC time as a number
 * between 1 and 366.
 * @param {Date|number} date A date or timestamp.
 * @return {number} The day of the year in UTC time.
 */
function utcdayofyear(date) {
  t1.setTime(+date);
  t1.setUTCHours(0, 0, 0, 0);
  const t0 = Date.UTC(t1.getUTCFullYear(), 0, 1);
  return Math.floor(1 + (+t1 - t0) / msDay);
}

/**
 * Return the current week of the year in local time as a number
 * between 1 and 52.
 * @param {Date|number} date A date or timestamp.
 * @return {number} The week of the year in local time.
 */
function week(date, firstday) {
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
 * Return the current week of the year in UTC time as a number
 * between 1 and 52.
 * @param {Date|number} date A date or timestamp.
 * @return {number} The week of the year in UTC time.
 */
function utcweek(date, firstday) {
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

export default {
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
  format_date: (date, shorten) => formatDate(t(date), !shorten),

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
  format_utcdate: (date, shorten) => formatUTCDate(t(date), !shorten),

  /**
   * Returns the number of milliseconds elapsed since midnight, January 1,
   * 1970 Universal Coordinated Time (UTC).
   * @return {number} The timestamp for now.
   */
  now: Date.now,

  /**
   * Returns the timestamp for a *date* as the number of milliseconds elapsed
   * since January 1, 1970 00:00:00 UTC.
   * @param {Date | number} date The input Date value.
   * @return {number} The timestamp value.
   */
  timestamp: (date) => +t(date),

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
  datetime,

  /**
   * Returns the year of the specified *date* according to local time.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The year value in local time.
   */
  year: (date) => t(date).getFullYear(),

  /**
   * Returns the zero-based quarter of the specified *date* according to
   * local time.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The quarter value in local time.
   */
  quarter: (date) => Math.floor(t(date).getMonth() / 3),

  /**
   * Returns the zero-based month of the specified *date* according to local
   * time. A value of `0` indicates January, `1` indicates February, and so on.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The month value in local time.
   */
  month: (date) => t(date).getMonth(),

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
  week,

  /**
   * Returns the date (day of month) of the specified *date* according
   * to local time.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The date (day of month) value.
   */
  date: (date) => t(date).getDate(),

  /**
   * Returns the day of the year (1-366) of the specified *date* according
   * to local time.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The day of the year in local time.
   */
  dayofyear,

  /**
   * Returns the Sunday-based day of the week (0-6) of the specified *date*
   * according to local time. A value of `0` indicates Sunday, `1` indicates
   * Monday, and so on.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The day of the week value in local time.
   */
  dayofweek: (date) => t(date).getDay(),

  /**
   * Returns the hour of the day for the specified *date* according
   * to local time.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The hour value in local time.
   */
  hours: (date) => t(date).getHours(),

  /**
   * Returns the minute of the hour for the specified *date* according
   * to local time.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The minutes value in local time.
   */
  minutes: (date) => t(date).getMinutes(),

  /**
   * Returns the seconds of the minute for the specified *date* according
   * to local time.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The seconds value in local time.
   */
  seconds: (date) => t(date).getSeconds(),

  /**
   * Returns the milliseconds of the second for the specified *date* according
   * to local time.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The milliseconds value in local time.
   */
  milliseconds: (date) => t(date).getMilliseconds(),

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
  utcdatetime,

  /**
   * Returns the year of the specified *date* according to Coordinated
   * Universal Time (UTC).
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The year value in UTC time.
   */
  utcyear: (date) => t(date).getUTCFullYear(),

  /**
   * Returns the zero-based quarter of the specified *date* according to
   * Coordinated Universal Time (UTC)
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The quarter value in UTC time.
   */
  utcquarter: (date) => Math.floor(t(date).getUTCMonth() / 3),

  /**
   * Returns the zero-based month of the specified *date* according to
   * Coordinated Universal Time (UTC). A value of `0` indicates January,
   * `1` indicates February, and so on.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The month value in UTC time.
   */
  utcmonth: (date) => t(date).getUTCMonth(),

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
  utcweek,

  /**
   * Returns the date (day of month) of the specified *date* according to
   * Coordinated Universal Time (UTC).
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The date (day of month) value in UTC time.
   */
  utcdate: (date) => t(date).getUTCDate(),

  /**
   * Returns the day of the year (1-366) of the specified *date* according
   * to Coordinated Universal Time (UTC).
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The day of the year in UTC time.
   */
  utcdayofyear,

  /**
   * Returns the Sunday-based day of the week (0-6) of the specified *date*
   * according to Coordinated Universal Time (UTC). A value of `0` indicates
   * Sunday, `1` indicates Monday, and so on.
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The day of the week in UTC time.
   */
  utcdayofweek: (date) => t(date).getUTCDay(),

  /**
   * Returns the hour of the day for the specified *date* according to
   * Coordinated Universal Time (UTC).
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The hours value in UTC time.
   */
  utchours: (date) => t(date).getUTCHours(),

  /**
   * Returns the minute of the hour for the specified *date* according to
   * Coordinated Universal Time (UTC).
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The minutes value in UTC time.
   */
  utcminutes: (date) => t(date).getUTCMinutes(),

  /**
   * Returns the seconds of the minute for the specified *date* according to
   * Coordinated Universal Time (UTC).
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The seconds value in UTC time.
   */
  utcseconds: (date) => t(date).getUTCSeconds(),

  /**
   * Returns the milliseconds of the second for the specified *date* according to
   * Coordinated Universal Time (UTC).
   * @param {Date | number} date The input Date or timestamp value.
   * @return {number} The milliseconds value in UTC time.
   */
  utcmilliseconds: (date) => t(date).getUTCMilliseconds()
};
