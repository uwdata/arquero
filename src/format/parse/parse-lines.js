import { NEWLINE, RETURN } from './constants.js';
import filter from './text-filter.js';

export default function(text, { skip = 0, comment = undefined }) {
  let N = text.length;
  let I = 0; // current character index

  // Strip the trailing newline.
  if (text.charCodeAt(N - 1) === NEWLINE) --N;
  if (text.charCodeAt(N - 1) === RETURN) --N;

  function read() {
    if (I >= N) return;

    const j = I;
    let eol = false;
    let i, c;

    // Find next newline.
    while (I < N) {
      if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
      else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
      if (eol) return text.slice(j, i);
    }

    // Return last line before EOF.
    return text.slice(j, N);
  }

  return filter(
    read, skip,
    comment && (x => (x || '').startsWith(comment))
  );
}
