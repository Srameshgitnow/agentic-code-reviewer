import { DiffFile } from './code-analyzer';

export interface ArchitectureIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  lineNumber?: number;
  filename?: string;
  evidence: string;
}

export class ArchitectureAnalyzer {
  analyze(files: DiffFile[]): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

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

  private analyzeLine(content: string, lineNumber: number, filename: string): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

    // Circular dependency
    if (this.hasCircularDependency(content)) {
      issues.push({
        type: 'circular_dependency',
        severity: 'high',
        message: 'Potential circular dependency detected',
        suggestion: 'Refactor code to break circular dependencies by extracting shared logic to a separate module',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Tight coupling
    if (this.hasTightCoupling(content)) {
      issues.push({
        type: 'tight_coupling',
        severity: 'medium',
        message: 'Classes/functions appear tightly coupled',
        suggestion: 'Use dependency injection or interfaces to reduce coupling',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // God object/function
    if (this.isGodObject(content)) {
      issues.push({
        type: 'god_object',
        severity: 'medium',
        message: 'Function/class doing too many things',
        suggestion: 'Consider breaking this into smaller, single-responsibility functions/classes',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Missing abstraction
    if (this.hasMissingAbstraction(content)) {
      issues.push({
        type: 'missing_abstraction',
        severity: 'low',
        message: 'Code duplication detected, consider creating an abstraction',
        suggestion: 'Extract common logic into a shared utility function or base class',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Poor error handling
    if (this.hasPoorErrorHandling(content)) {
      issues.push({
        type: 'poor_error_handling',
        severity: 'high',
        message: 'Missing or inadequate error handling',
        suggestion: 'Add try-catch blocks or error handlers for all async operations and external dependencies',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    return issues;
  }

  private hasCircularDependency(content: string): boolean {
    // Detects patterns like: import A from './a' inside './a'
    const importPatterns = [
      /import\s+.*\bfrom\s+['"]\.\//,
      /require\s*\(\s*['"]\.\//,
    ];
    // This is a simplified check; real circular detection needs full graph analysis
    return importPatterns.some(pattern => pattern.test(content)) && content.includes('export');
  }

  private hasTightCoupling(content: string): boolean {
    // Detects direct instantiation and tight dependencies
    const patterns = [
      /new\s+\w+\s*\(\)|this\.\w+\s*=\s*new\s+\w+/,
      /import.*from.*services.*import.*from.*controllers/,
    ];
    return patterns.some(pattern => pattern.test(content));
  }

  private isGodObject(content: string): boolean {
    // Heuristic: large number of responsibilities/methods
    const methodCount = (content.match(/(?:function|async|const|=>|private|public|protected)/g) || []).length;
    const branches = (content.match(/if|else|switch|case/g) || []).length;
    return methodCount > 10 && branches > 5;
  }

  private hasMissingAbstraction(content: string): boolean {
    // Look for similar code patterns that could be abstracted
    const lines = content.split('\n');
    const similarities = new Map<string, number>();
    
    for (const line of lines) {
      const normalized = line.replace(/\d+|["'][^"']*["']/g, 'X');
      similarities.set(normalized, (similarities.get(normalized) || 0) + 1);
    }

    // If we see similar patterns 2+ times, suggest abstraction
    return Array.from(similarities.values()).some(count => count >= 2);
  }

  private hasPoorErrorHandling(content: string): boolean {
    // Check for async operations without error handling
    const hasAsync = /async|await|Promise|\.then|\.catch/.test(content);
    const hasErrorHandling = /try|catch|\.catch|error|Error/.test(content);
    
    return hasAsync && !hasErrorHandling;
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.go', '.cs', '.rb', '.php'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }
}

export const architectureAnalyzer = new ArchitectureAnalyzer();
