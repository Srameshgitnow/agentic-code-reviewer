import { DiffFile } from './code-analyzer';

export interface SecurityIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  lineNumber?: number;
  filename?: string;
  evidence: string;
}

export class SecurityAnalyzer {
  analyze(files: DiffFile[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const file of files) {
      // Only analyze code files
      if (!this.isCodeFile(file.filename)) continue;

      for (const change of file.changes) {
        if (change.type !== 'addition') continue;

        const lineIssues = this.analyzeeLine(change.content, change.lineNumber || 0, file.filename);
        issues.push(...lineIssues);
      }
    }

    return issues;
  }

  private analyzeeLine(content: string, lineNumber: number, filename: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Hardcoded secrets
    if (this.hasHardcodedSecret(content)) {
      issues.push({
        type: 'hardcoded_secret',
        severity: 'critical',
        message: 'Hardcoded secret detected (API key, password, or token)',
        suggestion: 'Use environment variables or secret management system (e.g., AWS Secrets Manager, HashiCorp Vault)',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // SQL Injection
    if (this.hasSQLInjection(content)) {
      issues.push({
        type: 'sql_injection',
        severity: 'critical',
        message: 'Potential SQL injection vulnerability',
        suggestion: 'Use parameterized queries or prepared statements with proper escaping',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // XSS Vulnerability
    if (this.hasXSSVulnerability(content)) {
      issues.push({
        type: 'xss_vulnerability',
        severity: 'high',
        message: 'Potential Cross-Site Scripting (XSS) vulnerability',
        suggestion: 'Use innerHTML only with sanitized content or use textContent for text-only updates',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Missing input validation
    if (this.hasMissingInputValidation(content)) {
      issues.push({
        type: 'missing_validation',
        severity: 'high',
        message: 'Missing input validation detected',
        suggestion: 'Add validation for user input using libraries like Joi, Zod, or custom validators',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    // Insecure deserialization
    if (this.hasInsecureDeserialization(content)) {
      issues.push({
        type: 'insecure_deserialization',
        severity: 'high',
        message: 'Insecure deserialization detected',
        suggestion: 'Avoid using unsafe deserialization methods. Use JSON parsing with validation',
        lineNumber,
        filename,
        evidence: content.substring(0, 100),
      });
    }

    return issues;
  }

  private hasHardcodedSecret(content: string): boolean {
    const secretPatterns = [
      /password\s*[=:]\s*['"][^'"]{6,}['"]/i,
      /api[_-]?key\s*[=:]\s*['"][^'"]{10,}['"]/i,
      /secret\s*[=:]\s*['"][^'"]{10,}['"]/i,
      /token\s*[=:]\s*['"][^'"]{20,}['"]/i,
      /authorization\s*[=:]\s*['"]Bearer\s+[^'"]+['"]/i,
      /aws_access_key_id\s*[=:]/i,
      /private[_-]?key/i,
    ];
    return secretPatterns.some(pattern => pattern.test(content));
  }

  private hasSQLInjection(content: string): boolean {
    const sqlPatterns = [
      /execute\s*\(\s*["'`].*\$\{/i,
      /query\s*\(\s*["'`].*\$\{/i,
      /SELECT\s+.*WHERE\s+.*\+\s*["']/i,
      /INSERT\s+INTO.*VALUES.*\+\s*["']/i,
      /UPDATE\s+.*SET\s+.*\+\s*["']/i,
    ];
    return sqlPatterns.some(pattern => pattern.test(content));
  }

  private hasXSSVulnerability(content: string): boolean {
    const xssPatterns = [
      /\.innerHTML\s*=\s*\w+/,
      /dangerouslySetInnerHTML\s*=\s*\{/,
      /eval\s*\(/i,
      /new\s+Function\s*\(/i,
    ];
    return xssPatterns.some(pattern => pattern.test(content));
  }

  private hasMissingInputValidation(content: string): boolean {
    return /request\.body|query|params|argv/.test(content) && !/validate|schema|joi|zod|check/.test(content);
  }

  private hasInsecureDeserialization(content: string): boolean {
    const deserialPatterns = [
      /JSON\.parse\s*\(\s*\w+\s*\)/,
      /pickle\.loads/,
      /yaml\.load\s*\(/i,
      /unserialize\s*\(/i,
    ];
    return deserialPatterns.some(pattern => pattern.test(content));
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.go', '.cs', '.rb', '.php'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }
}

export const securityAnalyzer = new SecurityAnalyzer();
