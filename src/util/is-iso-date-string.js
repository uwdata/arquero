const iso_re = /^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/;

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isISODateString(value) {
  return value.match(iso_re) && !isNaN(Date.parse(value));
}
