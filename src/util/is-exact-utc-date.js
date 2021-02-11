export default function(d) {
  return d.getUTCHours() === 0
    && d.getUTCMinutes() === 0
    && d.getUTCSeconds() === 0
    && d.getUTCMilliseconds() === 0;
}