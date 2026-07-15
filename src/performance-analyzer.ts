import { DiffFile } from './code-analyzer';

export interface PerformanceIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  lineNumber?: number;
  filename?: string;
  evidence: string;
}

export class PerformanceAnalyzer {
  analyze(files: DiffFile[]): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    for (const file of files) {
      // Only analyze code files
      if (!this.isCodeFile(file.filename)) continue;

      for (const change of file.changes) {
        if (change.type !== 'addition') continue;

        const lineIssues = this.analyzeLine(change.content, change.lineNumber || 0, file.filename);
        issues.push(...lineIssues);
      }
    }

    return issues;
  }

  private analyzeLine(content: string, lineNumber: number, filename: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    // N+1 Query Problem
    if (this.hasN1QueryProblem(content)) {
      issues.push({
        type: 'n_plus_one_query',
        severity: 'high',
        message: 'Potential N+1 query problem detected',
        suggestion: 'Use eager loading with JOIN or batch queries. Consider using populate() for ORMs or INNER JOIN for SQL',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Nested loops with expensive operations
    if (this.hasExpensiveNestedLoop(content)) {
      issues.push({
        type: 'expensive_nested_loop',
        severity: 'high',
        message: 'Nested loop with potentially expensive operations',
        suggestion: 'Consider using a Set/Map for lookups or restructure algorithm to reduce nested iterations',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Missing memoization
    if (this.shouldUseMemoization(content)) {
      issues.push({
        type: 'missing_memoization',
        severity: 'medium',
        message: 'Function may benefit from memoization',
        suggestion: 'Consider caching results using memoization (e.g., lodash.memoize, React.useMemo)',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Inefficient data structures
    if (this.hasInefficientDataStructure(content)) {
      issues.push({
        type: 'inefficient_data_structure',
        severity: 'medium',
        message: 'Consider using more efficient data structure',
        suggestion: 'Use Set for O(1) lookups instead of Array, or Map for key-value pairs',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Large object creation in loop
    if (this.hasLargeObjectCreationInLoop(content)) {
      issues.push({
        type: 'object_creation_in_loop',
        severity: 'medium',
        message: 'Creating large objects in loop may impact performance',
        suggestion: 'Consider pre-allocating or moving object creation outside the loop',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    return issues;
  }

  private hasN1QueryProblem(content: string): boolean {
    // Detects patterns like: for (item in items) { db.query(...item) }
    const patterns = [
      /\.forEach\s*\(\s*.*?\s*=>\s*.*?\bdb\.|\.map\s*\(\s*.*?\s*=>\s*.*?\bdb\.|for\s*\(.*\bin\b.*\)\s*{[^}]*\bdb\./i,
      /\.map\s*\(\s*.*?\s*=>\s*.*?\bquery\(/i,
      /\.forEach.*database|\.forEach.*find\(/i,
    ];
    return patterns.some(pattern => pattern.test(content));
  }

  private hasExpensiveNestedLoop(content: string): boolean {
    // Count nested loops/iterations
    const forLoops = (content.match(/\bfor\b|\bwhile\b|\.forEach|\.map|\.filter/g) || []).length;
    const hasInnerQuery = /db\.|query\(|find\(|filter\(/.test(content);
    
    return forLoops >= 2 && hasInnerQuery;
  }

  private shouldUseMemoization(content: string): boolean {
    // Look for recursive calls or repeated calculations
    return /const.*=.*function|const.*=>.*\$|return.*\?.*\*/.test(content) && 
           /\breturn\b.*\bif\b|\bif\b.*\breturn\b/.test(content);
  }

  private hasInefficientDataStructure(content: string): boolean {
    // Detects patterns like: array.includes() in loops
    const patterns = [
      /\.includes\s*\(.*\).*\bfor\b|\bfor\b.*\.includes\s*\(/,
      /\.indexOf\s*\(.*\).*\bfor\b|\bfor\b.*\.indexOf\s*\(/,
      /\.find\s*\(.*\).*\bfor\b|\bfor\b.*\.find\s*\(/,
    ];
    return patterns.some(pattern => pattern.test(content));
  }

  private hasLargeObjectCreationInLoop(content: string): boolean {
    // Detects object/array creation in loops
    return /\bfor\b.*{[^}]*(?:new\s+\w+\s*\(|{.*:.*}|\[.*\])[^}]*}|\bwhile\b.*{[^}]*(?:new\s+\w+\s*\(|{.*:.*}|\[.*\])[^}]*}/i.test(content);
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.go', '.cs', '.rb', '.php'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }
}

export const performanceAnalyzer = new PerformanceAnalyzer();
