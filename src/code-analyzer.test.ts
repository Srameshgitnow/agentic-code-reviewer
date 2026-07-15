import { codeAnalyzer, DiffFile } from '../src/code-analyzer';

describe('CodeAnalyzer', () => {
  describe('parseDiff', () => {
    it('should parse a simple diff', () => {
      const diff = `diff --git a/test.ts b/test.ts
index 1234567..abcdefg 100644
--- a/test.ts
+++ b/test.ts
@@ -1,3 +1,3 @@
 const x = 1;
-const y = 2;
+const y = 3;
 const z = 4;`;

      const files = codeAnalyzer.parseDiff(diff);

      expect(files).toHaveLength(1);
      expect(files[0].filename).toBe('test.ts');
      expect(files[0].language).toBe('typescript');
      expect(files[0].additions).toBe(1);
      expect(files[0].deletions).toBe(1);
    });

    it('should detect language from extension', () => {
      const diff = `diff --git a/test.py b/test.py
index 1234567..abcdefg 100644
--- a/test.py
+++ b/test.py
@@ -1,1 +1,1 @@
-print("old")
+print("new")`;

      const files = codeAnalyzer.parseDiff(diff);

      expect(files[0].language).toBe('python');
    });

    it('should handle multiple files', () => {
      const diff = `diff --git a/file1.ts b/file1.ts
index 1234567..abcdefg 100644
--- a/file1.ts
+++ b/file1.ts
@@ -1,1 +1,1 @@
-const x = 1;
+const x = 2;
diff --git a/file2.js b/file2.js
index 2345678..bcdefgh 100644
--- a/file2.js
+++ b/file2.js
@@ -1,1 +1,1 @@
-const y = 1;
+const y = 2;`;

      const files = codeAnalyzer.parseDiff(diff);

      expect(files).toHaveLength(2);
      expect(files[0].filename).toBe('file1.ts');
      expect(files[1].filename).toBe('file2.js');
    });
  });

  describe('getHighRiskPatterns', () => {
    it('should detect hardcoded secrets', () => {
      const file: DiffFile = {
        filename: 'config.ts',
        language: 'typescript',
        oldLines: 0,
        newLines: 1,
        changes: [
          {
            type: 'addition',
            lineNumber: 1,
            content: 'const apiKey = "sk-1234567890abcdef";',
          },
        ],
        additions: 1,
        deletions: 0,
      };

      const patterns = codeAnalyzer.getHighRiskPatterns(file);

      expect(patterns.some(p => p.pattern === 'hardcoded_secret')).toBe(true);
    });
  });
});
