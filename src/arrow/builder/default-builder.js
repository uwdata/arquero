import { Builder } from 'apache-arrow';

export default function(type) {
  const b = Builder.new({
    type,
    nullValues: [null, undefined],
    highWaterMark: Infinity
  });
  return {
    set(value, index) { b.set(index, value); },
    data: () => b.finish().flush()
  };
}