/**
 * @param {string} path
 * @returns {'gzip' | 'deflate' | null}
 */
export function compressionType(path) {
  const ext = path.slice(-3).toLowerCase();
  return ext === '.gz' ? 'gzip'
    : ext === '.zz' ? 'deflate'
    : null;
}
