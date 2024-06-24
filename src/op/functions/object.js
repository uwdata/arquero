import NULL from '../../util/null.js';
import has from '../../util/has.js';
import isMap from '../../util/is-map.js';
import isMapOrSet from '../../util/is-map-or-set.js';

function array(iter) {
  return Array.from(iter);
}

export default {
  has:      (obj, key) => isMapOrSet(obj) ? obj.has(key)
              : obj != null ? has(obj, key)
              : false,
  keys:     (obj) => isMap(obj) ? array(obj.keys())
              : obj != null ? Object.keys(obj)
              : [],
  values:   (obj) => isMapOrSet(obj) ? array(obj.values())
              : obj != null ? Object.values(obj)
              : [],
  entries:  (obj) => isMapOrSet(obj) ? array(obj.entries())
              : obj != null ? Object.entries(obj)
              : [],
  object:   (entries) => entries ? Object.fromEntries(entries) : NULL
};
