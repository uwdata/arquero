import has from '../../util/has';
import isMap from '../../util/is-map';
import isMapOrSet from '../../util/is-map-or-set';

function array(iter) {
  return Array.from(iter);
}

export default {
  has:     (obj, key) => isMapOrSet(obj) ? obj.has(key) : has(obj, key),
  keys:    (obj) => isMap(obj) ? array(obj.keys()) : Object.keys(obj),
  values:  (obj) => isMapOrSet(obj) ? array(obj.values()) : Object.values(obj),
  entries: (obj) => isMapOrSet(obj) ? array(obj.entries()) : Object.entries(obj)
};