export default function(message, cause) {
  // @ts-ignore
  throw Error(message, { cause });
}
