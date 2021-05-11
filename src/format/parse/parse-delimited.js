import { EOF, EOL, NEWLINE, QUOTE, RETURN } from './constants';
import filter from './text-filter';
import error from '../../util/error';

// Adapted from d3-dsv: https://github.com/d3/d3-dsv/blob/master/src/dsv.js
// Copyright 2013-2016 Mike Bostock
// All rights reserved.
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
// * Redistributions of source code must retain the above copyright notice, this
//   list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
// * Neither the name of the author nor the names of contributors may be used to
//   endorse or promote products derived from this software without specific prior
//   written permission.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

export default function(text, { delimiter = ',', skip, comment }) {
  if (delimiter.length !== 1) {
    error(`Text "delimiter" should be a single character, found "${delimiter}"`);
  }
  const delimCode = delimiter.charCodeAt(0);

  let N = text.length;
  let I = 0; // current character index
  let t; // current token
  let eof = N <= 0; // current token followed by EOF?
  let eol = false; // current token followed by EOL?

  // Strip the trailing newline.
  if (text.charCodeAt(N - 1) === NEWLINE) --N;
  if (text.charCodeAt(N - 1) === RETURN) --N;

  function token() {
    if (eof) return EOF;
    if (eol) return eol = false, EOL;

    // Unescape quotes.
    const j = I;
    let i, c;
    if (text.charCodeAt(j) === QUOTE) {
      while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
      if ((i = I) >= N) eof = true;
      else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
      else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
      return text.slice(j + 1, i - 1).replace(/""/g, '"');
    }

    // Find next delimiter or newline.
    while (I < N) {
      if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
      else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
      else if (c !== delimCode) continue;
      return text.slice(j, i);
    }

    // Return last token before EOF.
    return eof = true, text.slice(j, N);
  }

  function next() {
    if ((t = token()) !== EOF) {
      const row = [];
      while (t !== EOL && t !== EOF) row.push(t), t = token();
      return row;
    }
  }

  return filter(
    next, skip,
    comment && (x => (x && x[0] || '').startsWith(comment))
  );
}