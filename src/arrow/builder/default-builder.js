import { makeBuilder } from 'apache-arrow';

export default function(type) {
  const b = makeBuilder({
    type,
    nullValues: [null, undefined]
  });
  return {
    set(value, index) { b.set(index, value); },
    data: () => b.finish().flush()
  };
}