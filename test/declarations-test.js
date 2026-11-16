import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

describe('TypeScript declarations', () => {
  it('compile for consumers with library checking enabled', function() {
    this.timeout(30000);
    const output = mkdtempSync(join(root, '.test-declarations-'));
    try {
      const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
      const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
      const program = ts.createProgram(parsed.fileNames, {
        ...parsed.options,
        outDir: output
      });
      const emitted = program.emit();
      assert.equal(emitted.emitSkipped, false);
      assert.deepEqual(emitted.diagnostics, []);
      const consumer = join(output, 'consumer.ts');
      writeFileSync(consumer, `
        import { table } from './index.js';
        const left = table({ key: [1] });
        const right = table({ key: [1], value: ['a'] });
        left.lookup(right);
        left.lookup(right, ['key', 'key']);
        left.lookup(right, ['key', 'key'], 'value');
        left.lookup(right, ['key', 'key'], { result: 'value' });
      `);
      const check = ts.createProgram([consumer], {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        strict: true,
        noEmit: true,
        skipLibCheck: false
      });
      const diagnostics = ts.getPreEmitDiagnostics(check);
      assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, {
        getCanonicalFileName: name => name,
        getCurrentDirectory: () => root,
        getNewLine: () => '\n'
      }));
    } finally {
      rmSync(output, { recursive: true, force: true });
    }
  });
});
