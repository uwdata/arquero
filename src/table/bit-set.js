const ONE = 0x80000000;
const ALL = 0xFFFFFFFF;

export default class BitSet {
  constructor(size) {
    this._size = size;
    this._bits = new Uint32Array(Math.ceil(size / 32));
  }

  get length() {
    return this._size;
  }

  // https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetKernighan
  count() {
    const n = this._bits.length;
    let count = 0;
    for (let i = 0; i < n; ++i) {
      for (let b = this._bits[i]; b; ++count) {
        b &= b - 1;
      }
    }
    return count;
  }

  get(i) {
    return this._bits[i >> 5] & (ONE >>> i);
  }

  set(i) {
    this._bits[i >> 5] |= (ONE >>> i);
  }

  clear(i) {
    this._bits[i >> 5] &= ~(ONE >>> i);
  }

  scan(fn) {
    for (let i = this.next(0); i >= 0; i = this.next(i + 1)) {
      fn(i);
    }
  }

  next(i) {
    const bits = this._bits;
    const n = bits.length;

    let index = i >> 5;
    let curr = bits[index] & (ALL >>> i);

    for (; index < n; curr = bits[++index]) {
      if (curr !== 0) {
        return (index * 32) + Math.clz32(curr);
      }
    }

    return -1;
  }

  nth(n) {
    let i = this.next(0);
    while (n-- && i >= 0) i = this.next(i + 1);
    return i;
  }

  not() {
    const bits = this._bits;
    const n = bits.length;

    // invert all bits
    for (let i = 0; i < n; ++i) {
      bits[i] = ~bits[i];
    }

    // unset extraneous trailing bits
    const tail = this._size % 32;
    if (tail) {
      bits[n - 1] &= ONE >> (tail - 1);
    }

    return this;
  }

  and(bitset) {
    const a = this._bits;
    const b = bitset._bits;
    const s = new BitSet(Math.min(this.length, bitset.length));
    const c = s._bits;
    const n = c.length;

    for (let i = 0; i < n; ++i) {
      c[i] = a[i] & b[i];
    }

    return s;
  }

  or(bitset) {
    const a = this._bits;
    const b = bitset._bits;
    const s = new BitSet(Math.max(this.length, bitset.length));
    const c = s._bits;
    const n = c.length;

    for (let i = 0; i < n; ++i) {
      c[i] = a[i] | b[i];
    }

    return s;
  }
}