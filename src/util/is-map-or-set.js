import isMap from './is-map.js';
import isSet from './is-set.js';

export default function(value) {
  return isMap(value) || isSet(value);
}
