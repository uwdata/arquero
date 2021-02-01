const ONE = 0x80000000;
const ALL = 0xFFFFFFFF;

/**
 * Represent an indexable set of bits.
 */
export default class BitSet {
  /**
   * Instantiate a new BitSet instance.
   * @param {number} size The number of bits.
   */
  constructor(size) {
    this._size = size;
    this._bits = new Uint32Array(Math.ceil(size / 32));
  }

  /**
   * The number of bits.
   * @return {number}
   */
  get length() {
    return this._size;
  }

  /**
   * The number of bits set to one.
   * https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetKernighan
   * @return {number}
   */
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

  /**
   * Get the bit at a given index.
   * @param {number} i The bit index.
   */
  get(i) {
    return this._bits[i >> 5] & (ONE >>> i);
  }

  /**
   * Set the bit at a given index to one.
   * @param {number} i The bit index.
   */
  set(i) {
    this._bits[i >> 5] |= (ONE >>> i);
  }

  /**
   * Clear the bit at a given index to zero.
   * @param {number} i The bit index.
   */
  clear(i) {
    this._bits[i >> 5] &= ~(ONE >>> i);
  }

  /**
   * Scan the bits, invoking a callback function with the index of
   * each non-zero bit.
   * @param {(i: number) => void} fn A callback function.
   */
  scan(fn) {
    for (let i = this.next(0); i >= 0; i = this.next(i + 1)) {
      fn(i);
    }
  }

  /**
   * Get the next non-zero bit starting from a given index.
   * @param {number} i The bit index.
   */
  next(i) {
    const bits = this._bits;
    const n = bits.length;

    let index = i >> 5;
    let curr = bits[index] & (ALL >>> i);

    for (; index < n; curr = bits[++index]) {
      if (curr !== 0) {
        return (index << 5) + Math.clz32(curr);
      }
    }

    return -1;
  }

  /**
   * Return the index of the nth non-zero bit.
   * @param {number} n The number of non-zero bits to advance.
   * @return {number} The index of the nth non-zero bit.
   */
  nth(n) {
    let i = this.next(0);
    while (n-- && i >= 0) i = this.next(i + 1);
    return i;
  }

  /**
   * Negate all bits in this bitset.
   * Modifies this BitSet in place.
   * @return {this}
   */
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

  /**
   * Compute the logical AND of this BitSet and another.
   * @param {BitSet} bitset The BitSet to combine with.
   * @return {BitSet} This BitSet updated with the logical AND.
   */
  and(bitset) {
    if (bitset) {
      const a = this._bits;
      const b = bitset._bits;
      const n = a.length;

      for (let i = 0; i < n; ++i) {
        a[i] &= b[i];
      }
    }
    return this;
  }

  /**
   * Compute the logical OR of this BitSet and another.
   * @param {BitSet} bitset The BitSet to combine with.
   * @return {BitSet} This BitSet updated with the logical OR.
   */
  or(bitset) {
    if (bitset) {
      const a = this._bits;
      const b = bitset._bits;
      const n = a.length;

      for (let i = 0; i < n; ++i) {
        a[i] |= b[i];
      }
    }
    return this;
  }
}