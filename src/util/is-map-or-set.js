import isMap from './is-map';
import isSet from './is-set';

export default function(value) {
  return isMap(value) || isSet(value);
}