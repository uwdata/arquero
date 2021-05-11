export default function(read, skip, drop) {
  // skip initial lines, if requested
  let s = +skip || 0;
  while (--s >= 0) read();

  // return filtered stream
  return drop ? () => {
    let line;
    while (!line) {
      if (drop(line = read())) line = null;
      else return line;
    }
  } : read;
}
