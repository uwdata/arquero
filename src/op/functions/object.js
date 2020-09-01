import has from '../../util/has';

export default {
  has:    (obj, property) => has(obj, property),
  keys:   (obj) => Object.keys(obj),
  values: (obj) => Object.values(obj)
};