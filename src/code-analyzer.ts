export interface DiffFile {
  filename: string;
  language: string;
  oldLines: number;
  newLines: number;
  changes: DiffChange[];
  additions: number;
  deletions: number;
}

export interface DiffChange {
  type: 'addition' | 'deletion' | 'context';
  lineNumber: number;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export class CodeAnalyzer {
  parseDiff(diffContent: string): DiffFile[] {
    const files: DiffFile[] = [];
    const filePattern = /^diff --git a\/(.*?) b\/(.*?)$/gm;
    const hunksPattern = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/gm;

    let fileMatch;
    let lastFileStart = 0;

    while ((fileMatch = filePattern.exec(diffContent)) !== null) {
      if (fileMatch.index > lastFileStart && files.length > 0) {
        const fileDiffContent = diffContent.substring(lastFileStart, fileMatch.index);
        this.parseFileContent(files[files.length - 1], fileDiffContent);
      }

      const filename = fileMatch[2];
      files.push({
        filename,
        language: this.detectLanguage(filename),
        oldLines: 0,
        newLines: 0,
        changes: [],
        additions: 0,
        deletions: 0,
      });

      lastFileStart = fileMatch.index;
    }

    // Parse the last file
    if (files.length > 0 && lastFileStart < diffContent.length) {
      this.parseFileContent(files[files.length - 1], diffContent.substring(lastFileStart));
    }

    return files;
  }

  private parseFileContent(file: DiffFile, content: string): void {
    const lines = content.split('\n');
    let currentLineNum = 0;
    let oldLineNum = 0;
    let newLineNum = 0;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+) \+(\d+)/);
        if (match) {
          oldLineNum = parseInt(match[1]);
          newLineNum = parseInt(match[2]);
        }
        continue;
      }

      if (!line.startsWith('diff') && !line.startsWith('index') && !line.startsWith('---') && !line.startsWith('+++')) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          file.changes.push({
            type: 'addition',
            lineNumber: newLineNum++,
            content: line.substring(1),
            newLineNumber: newLineNum,
          });
          file.additions++;
          file.newLines++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          file.changes.push({
            type: 'deletion',
            lineNumber: oldLineNum++,
            content: line.substring(1),
            oldLineNumber: oldLineNum,
          });
          file.deletions++;
          file.oldLines++;
        } else if (line.startsWith(' ')) {
          file.changes.push({
            type: 'context',
            lineNumber: oldLineNum++,
            content: line.substring(1),
          });
          file.oldLines++;
          file.newLines++;
        }
      }
    }
  }

  private detectLanguage(filename: string): string {
    const ext = filename.split('.').pop() || '';
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      java: 'java',
      cs: 'csharp',
      go: 'go',
      rb: 'ruby',
      php: 'php',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
    };
    return languageMap[ext] || 'unknown';
  }

  getHighRiskPatterns(file: DiffFile): Array<{ pattern: string; risk: string }> {
    const patterns: Array<{ pattern: string; risk: string }> = [];

    for (const change of file.changes) {
      if (change.type !== 'addition') continue;

      const content = change.content;

      // Security patterns
      if (this.containsSecret(content)) {
        patterns.push({ pattern: 'hardcoded_secret', risk: 'high' });
      }
      if (this.hasSQLInjectionRisk(content)) {
        patterns.push({ pattern: 'sql_injection', risk: 'high' });
      }
      if (this.hasXSSRisk(content)) {
        patterns.push({ pattern: 'xss_vulnerability', risk: 'high' });
      }

      // Performance patterns
      if (this.hasN1Pattern(content)) {
        patterns.push({ pattern: 'n_plus_one_query', risk: 'medium' });
      }
      if (this.hasNestedLoop(content)) {
        patterns.push({ pattern: 'nested_loop', risk: 'medium' });
      }
    }

    return patterns;
  }

  private containsSecret(content: string): boolean {
    const secretPatterns = [
      /password\s*=\s*['"][^'"]+['"]/i,
      /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
      /secret\s*=\s*['"][^'"]+['"]/i,
      /token\s*=\s*['"][^'"]+['"]/i,
      /aws_access_key_id/i,
      /aws_secret_access_key/i,
    ];
    return secretPatterns.some(pattern => pattern.test(content));
  }

  private hasSQLInjectionRisk(content: string): boolean {
    const sqlPatterns = [
      /execute\s*\(\s*[`'"]+.*?\$|query\s*\(\s*[`'"]+.*?\$/i,
      /SELECT\s+.*\s+WHERE\s+.*\+/i,
      /INSERT\s+.*VALUES\s*\(\s*.*\+/i,
    ];
    return sqlPatterns.some(pattern => pattern.test(content));
  }

  private hasXSSRisk(content: string): boolean {
    const xssPatterns = [
      /innerHTML\s*=\s*\w+/i,
      /dangerouslySetInnerHTML/,
      /eval\s*\(/i,
    ];
    return xssPatterns.some(pattern => pattern.test(content));
  }

  private hasN1Pattern(content: string): boolean {
    return /\bfor\b.*\bin\b.*\bdatabase|forEach.*\.find\(|query.*loop/i.test(content);
  }

  private hasNestedLoop(content: string): boolean {
    const forLoopCount = (content.match(/\bfor\b|\bwhile\b/g) || []).length;
    return forLoopCount >= 2;
  }
}

export const codeAnalyzer = new CodeAnalyzer();
