import { formatDate, formatUTCDate } from '../../util/format-date';
import parseIsoDate from '../../util/parse-iso-date';

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
 * @return {date} The resuting Date value.
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
 * @return {date} The resuting Date value.
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

function dayofyear(date) {
  t1.setTime(+date);
  t1.setHours(0, 0, 0, 0);
  t0.setTime(+t1);
  t0.setMonth(0);
  t0.setDate(1);
  const tz = (t1.getTimezoneOffset() - t0.getTimezoneOffset()) * msMinute;
  return Math.floor(1 + ((t1 - t0) - tz) / msDay);
}

function utcdayofyear(date) {
  t1.setTime(+date);
  t1.setUTCHours(0, 0, 0, 0);
  const t0 = Date.UTC(t1.getUTCFullYear(), 0, 1);
  return Math.floor(1 + (t1 - t0) / msDay);
}

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
  return Math.floor((1 + (t1 - t0) - tz) / msWeek);
}

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
  return Math.floor((1 + (t1 - t0)) / msWeek);
}

export default {
  format_date:     (date, shorten) => formatDate(t(date), !shorten),
  format_utcdate:  (date, shorten) => formatUTCDate(t(date), !shorten),
  timestamp:       (date) => +t(date),
  year:            (date) => t(date).getFullYear(),
  quarter:         (date) => Math.floor(t(date).getMonth() / 3),
  month:           (date) => t(date).getMonth(),
  date:            (date) => t(date).getDate(),
  dayofweek:       (date) => t(date).getDay(),
  hours:           (date) => t(date).getHours(),
  minutes:         (date) => t(date).getMinutes(),
  seconds:         (date) => t(date).getSeconds(),
  milliseconds:    (date) => t(date).getMilliseconds(),
  utcyear:         (date) => t(date).getUTCFullYear(),
  utcquarter:      (date) => Math.floor(t(date).getUTCMonth() / 3),
  utcmonth:        (date) => t(date).getUTCMonth(),
  utcdate:         (date) => t(date).getUTCDate(),
  utcdayofweek:    (date) => t(date).getUTCDay(),
  utchours:        (date) => t(date).getUTCHours(),
  utcminutes:      (date) => t(date).getUTCMinutes(),
  utcseconds:      (date) => t(date).getUTCSeconds(),
  utcmilliseconds: (date) => t(date).getUTCMilliseconds(),
  datetime,
  dayofyear,
  week,
  utcdatetime,
  utcdayofyear,
  utcweek,
  now: Date.now
};