import { BREAK, EOL, NEWLINE, QUOTE, RETURN } from './constants.js';
import { error } from '../../util/error.js';

function unquote(str) {
  return str.slice(1, -1).replace(/""/g, '"');
}

/**
 * Returns a new delimited text stream transformer.
 * @param {string} [delimiter=','] The column delimiter string.
 *  The value should be a single character.
 * @returns {Transformer<string, string[][]>}
 */
export function delimitedTextTransformer(delimiter = ',') {
  if (delimiter.length !== 1) {
    error(`Text delimiter should be a single character, found "${delimiter}"`);
  }
  const delimCode = delimiter.charCodeAt(0);

  let I = 0; // current chunk character index
  let N = 0; // length of current text chunk
  let qc = 0; // consecutive quote char count
  let eol = false; // current token followed by EOL?
  let skipNewline = false; // skip newline after carriage return?
  let inQuote = false; // chunk boundary within quoted text?
  let chunk = null; // current text chunk
  let fragment = null; // text fragment leftover from prior chunk
  let row = []; // current row of delimited text values

  function addFragment(str) {
    fragment = fragment ? (fragment + str) : str;
  }

  function token() {
    if (eol) return eol = false, EOL;
    const j = I;
    const jq = chunk.charCodeAt(j) === QUOTE;

    // handle quotes, unescape nested double quotes
    if (inQuote || jq) {
      let q = qc && !jq; // indicate completion of quote
      if (inQuote && !q) {
        --I; // back up if cross-chunk quote
      } else if (jq) {
        ++qc; // increment consecutive quote chars
      }
      inQuote = true;

      // process characters within quote
      if (!q) {
        while (++I < N) {
          if (chunk.charCodeAt(I) === QUOTE) {
            if (++qc === 3) {
              // consume escaped quote char ("")
              qc = 1;
            } else if ((I + 1) < N && chunk.charCodeAt(I + 1) !== QUOTE) {
              qc = 0; // reset quote char count
              q = true; // reached end of quote
              ++I;
              break;
            }
          }
        }
        if (!q) {
          // end of chunk and still in quote
          // break off intra-quote fragment
          addFragment(chunk.slice(j, N));
          return BREAK;
        }
      }

      // extract and unescape quoted text
      const quoted = unquote((fragment ?? '') + chunk.slice(j, I));
      qc = 0;
      inQuote = false;
      fragment = null;

      // if a quote stops at end of chunk, treat as normal fragment
      if (I >= N) {
        fragment = quoted;
        return BREAK;
      }

      // check for end of line
      const c = chunk.charCodeAt(I++);
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
      const c = chunk.charCodeAt(i = I++);
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
        else {
          row.push((fragment ?? '') + t);
          fragment = null;
        }
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
        if (fragment != null) {
          row.push(qc === 2 ? unquote(fragment) : fragment);
        }
        controller.enqueue([row]);
      }
    }
  };
}
