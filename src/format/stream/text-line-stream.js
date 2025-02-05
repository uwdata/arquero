import { BREAK, NEWLINE, RETURN } from './constants.js';

/**
 * Returns a new text line stream transformer.
 * @returns {Transformer<string, string[]>}
 */
export function textLineTransformer() {
  let I = 0; // current chunk character index
  let skipNewline = false; // skip newline after carriage return
  let fragment = ''; // remaining fragment from previous chunk

  function parseLine(text) {
    const N = text.length;
    const j = I;

    // find next newline
    while (I < N) {
      const c = text.charCodeAt(I);
      const i = ++I;
      if (c === RETURN) {
        if (I >= N) skipNewline = true;
        else if (text.charCodeAt(I) === NEWLINE) ++I;
      } else if (c !== NEWLINE) {
        continue;
      }
      return text.slice(j, i);
    }

    // current line straddles chunks
    fragment += text.slice(j, N);
    return BREAK;
  }

  return {
    start() {},
    transform(chunk, controller) {
      I = 0;
      let line;
      const lines = [];
      if (skipNewline) {
        if (chunk.charCodeAt(I) === NEWLINE) ++I;
        skipNewline = false;
      }
      if (fragment) {
        line = parseLine(chunk);
        if (line === BREAK) {
          controller.enqueue(lines);
          return;
        }
        else (lines.push(fragment + line), fragment = '');
      }
      while ((line = parseLine(chunk)) !== BREAK) {
        lines.push(line);
      }
      controller.enqueue(lines);
    },
    flush(controller) {
      if (fragment) controller.enqueue([fragment]);
    }
  };
}
