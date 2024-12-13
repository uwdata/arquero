export function error(message, cause) {
  // @ts-ignore
  throw Error(message, { cause });
}
