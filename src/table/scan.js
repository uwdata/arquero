// const stop = 'const s = () => i = n;';
// const rawBody = `${stop} for (; i < n; ++i) f(i, d, s);`;
// const idxBody = `${stop} for (; i < n; ++i) f(r[i], d, s);`;
// const bitBody = `${stop} let c = n - i + 1; for (i = b.nth(i); --c; i = b.next(i + 1)) f(i, d, s);`;

// function scanRaw(fn, data, i, n) {
//   Function('f', 'd', 'i', 'n', rawBody)(fn, data, i, n);
// }

// function scanIndices(fn, data, i, n, idx) {
//   Function('f', 'd', 'i', 'n', 'r', idxBody)(fn, data, i, n, idx);
// }

// function scanFilter(fn, data, i, n, bits) {
//   Function('f', 'd', 'i', 'n', 'b', bitBody)(fn, data, i, n, bits);
// }

// export default function(table, fn, order, limit = Infinity, offset = 0) {
//   const mask = table._filter;
//   const nrows = table._nrows;
//   const data = table._data;

//   const i = offset || 0;
//   const n = Math.min(nrows, i + limit);
//   if (i > nrows) return;

//   order && table.isOrdered() ? scanIndices(fn, data, i, n, table.indices())
//     : mask ? scanFilter(fn, data, i, n, mask)
//     : scanRaw(fn, data, i, n);
// }

// TODO: match table scan functionality -- test again
// export default function(code, args, table, i, n, vals) {
//   const bits = table.mask();
//   const data = table.data();
//   if (bits) {
//     Function(
//       'data', 'i', 'n', 'bits', ...args,
//       `for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) ${code}`
//     )(data, i, n, bits, ...vals);
//   } else {
//     Function(
//       'data', 'i', 'n', ...args,
//       `for (; i < n; ++i) ${code}`
//     )(data, i, n, ...vals);
//   }
// }

export default function(table, fn, order, limit = Infinity, offset = 0) {
  const nrows = table._nrows;
  const bits = table._filter;
  const data = table._data;

  const i = offset || 0;
  const n = Math.min(nrows, i + limit);
  if (i > nrows) return;

  if (order && table.isOrdered()) {
    Function(
      'fn', 'data', 'i', 'n', 'idx',
      'for (; i < n; ++i) fn(idx[i], data);'
    )(fn, data, i, n, table.indices());
  } else if (bits) {
    Function(
      'fn', 'data', 'i', 'n', 'bits',
      'for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) fn(i, data);'
    )(fn, data, i, n, bits);
  } else {
    Function(
      'fn', 'data', 'i', 'n',
      'for (; i < n; ++i) fn(i, data);'
    )(fn, data, i, n);
  }
}