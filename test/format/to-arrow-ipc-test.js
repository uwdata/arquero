import assert from 'node:assert';
import { table, toArrowIPC } from '../../src/index.js';

describe('toArrowIPC', () => {
  it('generates the correct output for file option', () => {
    const dt = table({
      w: ['a', 'b', 'a'],
      x: [1, 2, 3],
      y: [1.6181, 2.7182, 3.1415],
      z: [true, true, false]
    });

    const buffer = toArrowIPC(dt, { format: 'file' });

    assert.deepEqual(
      buffer.slice(0, 8),
      new Uint8Array([65, 82, 82, 79, 87, 49, 0, 0])
    );
  });

  it('generates the correct output for stream option', () => {
    const dt = table({
      w: ['a', 'b', 'a'],
      x: [1, 2, 3],
      y: [1.6181, 2.7182, 3.1415],
      z: [true, true, false]
    });

    const buffer = toArrowIPC(dt, { format: 'stream' });

    assert.deepEqual(
      buffer.slice(0, 4),
      new Uint8Array([255, 255, 255, 255])
    );
  });

  it('defaults to using stream option', () => {
    const dt = table({
      w: ['a', 'b', 'a'],
      x: [1, 2, 3],
      y: [1.6181, 2.7182, 3.1415],
      z: [true, true, false]
    });

    const buffer = toArrowIPC(dt);

    assert.deepEqual(
      buffer.slice(0, 4),
      new Uint8Array([255, 255, 255, 255])
    );
  });

  it('throws an error if the format is not stream or file', () => {
    assert.throws(() => {
      const dt = table({
        w: ['a', 'b', 'a'],
        x: [1, 2, 3],
        y: [1.6181, 2.7182, 3.1415],
        z: [true, true, false]
      });
      toArrowIPC(dt, { format: 'nonsense' });
    }, 'Unrecognized output format');
  });
});
