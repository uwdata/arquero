import { BREAK, EOL, NEWLINE, QUOTE, RETURN } from './constants.js';
import { error } from '../../util/error.js';

function unquote(str) {
  return str.slice(1, -1).replace(/""/g, '"');
}

/**
 * @extends {TransformStream<string,string[][]>}
 */
export class DelimitedTextStream extends TransformStream {
  constructor(delimiter = ',') {
    if (delimiter.length !== 1) {
      error(`Text delimiter should be a single character, found "${delimiter}"`);
    }
    const delimCode = delimiter.charCodeAt(0);
    super(delimitedRowTransformer(delimCode));
  }
}

function delimitedRowTransformer(delimCode) {
  let I = 0; // current chunk character index
  let N = 0; // length of current text chunk
  let eol = false; // current token followed by EOL?
  let skipNewline = false; // skip newline after carriage return?
  let inQuote = false; // chunk boundary within quoted text?
  let atQuote = false; // chunk boundary right after quote char?
  let chunk = null; // current text chunk
  let fragment = null; // text fragment leftover from prior chunk
  let row = []; // current row of delimited text values

  function addFragment(str) {
    fragment = fragment ? (fragment + str) : str;
  }

  function token() {
    if (eol) return eol = false, EOL;
    const j = I;
    let c;

    // handle quotes, unescape nested double quotes
    if (inQuote || chunk.charCodeAt(j) === QUOTE) {
      let q = atQuote && chunk.charCodeAt(j) !== QUOTE; // indicate completion of quote
      atQuote = false;
      inQuote = true;

      // within quotes
      if (!q) {
        while (++I < N) {
          if (chunk.charCodeAt(I) === QUOTE) {
            if (++I < N) {
              if (chunk.charCodeAt(I) !== QUOTE) { q = true; break; }
            } else {
              // otherwise, break fragment at quote char
              addFragment(chunk.slice(j, N));
              atQuote = true;
              return BREAK;
            }
          }
        }

        // if end of chunk, break as intra-quote fragment
        if (!q) {
          addFragment(chunk.slice(j, N));
          return BREAK;
        }
      }

      // extract and unescape quoted text
      const quoted = unquote((fragment ?? '') + chunk.slice(j, I));
      inQuote = false;
      fragment = null;

      // if quote stops at end of chunk, treat as normal fragment
      if (I >= N) {
        fragment = quoted;
        return BREAK;
      }

      // check for end of line
      c = chunk.charCodeAt(I++);
      if (c === NEWLINE) eol = true;
      else if (c === RETURN) {
        eol = true;
        if (I >= N) skipNewline = true;
        else if (chunk.charCodeAt(I) === NEWLINE) ++I;
      }
      return quoted;
    }

    // find next delimiter or newline
    let i;
    while (I < N) {
      c = chunk.charCodeAt(i = I++);
      if (c === NEWLINE) eol = true;
      else if (c === RETURN) {
        eol = true;
        if (I >= N) skipNewline = true;
        else if (chunk.charCodeAt(I) === NEWLINE) ++I;
      }
      else if (c !== delimCode) continue;
      return chunk.slice(j, i);
    }

    // current token straddles chunks, save fragment
    addFragment(chunk.slice(j, N));
    return BREAK;
  }

  return {
    start() {},

    transform(next, controller) {
      chunk = next;
      N = chunk.length;
      I = 0;
      const batch = [];
      let t;

      if (skipNewline) {
        if (chunk.charCodeAt(I) === NEWLINE) ++I;
        skipNewline = false;
      }

      if (fragment != null) {
        if ((t = token()) === BREAK) {
          controller.enqueue(batch);
          return;
        }
        else (row.push((fragment ?? '') + t), fragment = null);
      }

      while (true) {
        if ((t = token()) === BREAK) {
          controller.enqueue(batch);
          return;
        }
        else if (t === EOL) (batch.push(row), row = []);
        else row.push(t);
      }
    },

    flush(controller) {
      if (row.length || fragment) {
        if (fragment != null) row.push(fragment);
        controller.enqueue([row]);
      }
    }
  };
}
