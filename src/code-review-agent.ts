import { DiffFile } from './code-analyzer';
import { SecurityIssue, securityAnalyzer } from './security-analyzer';
import { PerformanceIssue, performanceAnalyzer } from './performance-analyzer';
import { ArchitectureIssue, architectureAnalyzer } from './architecture-analyzer';

export type Issue = SecurityIssue | PerformanceIssue | ArchitectureIssue;

export interface ReviewState {
  files: DiffFile[];
  prNumber: number;
  repoOwner: string;
  repoName: string;
  commitSha: string;
  
  // Analysis results
  securityIssues: SecurityIssue[];
  performanceIssues: PerformanceIssue[];
  architectureIssues: ArchitectureIssue[];
  
  // Combined findings
  allIssues: Issue[];
  feedback: string;
}

export class CodeReviewAgent {
  async runReview(state: ReviewState): Promise<ReviewState> {
    console.log(`Starting code review for PR #${state.prNumber}`);

    // Step 1: Parse diff (already done in webhook handler)
    console.log(`Analyzing ${state.files.length} files`);

    // Step 2: Security Check
    console.log('Running security analysis...');
    state.securityIssues = securityAnalyzer.analyze(state.files);
    console.log(`Found ${state.securityIssues.length} security issues`);

    // Step 3: Performance Check
    console.log('Running performance analysis...');
    state.performanceIssues = performanceAnalyzer.analyze(state.files);
    console.log(`Found ${state.performanceIssues.length} performance issues`);

    // Step 4: Architecture Check
    console.log('Running architecture analysis...');
    state.architectureIssues = architectureAnalyzer.analyze(state.files);
    console.log(`Found ${state.architectureIssues.length} architecture issues`);

    // Step 5: Combine findings
    state.allIssues = [
      ...state.securityIssues,
      ...state.performanceIssues,
      ...state.architectureIssues,
    ];

    // Filter and prioritize
    state.allIssues.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity as keyof typeof severityOrder] - 
             severityOrder[b.severity as keyof typeof severityOrder];
    });

    console.log(`Total issues found: ${state.allIssues.length}`);

    return state;
  }

  async generateFeedback(state: ReviewState): Promise<string> {
    if (state.allIssues.length === 0) {
      return '✅ **Code Review Complete**\n\nNo issues detected! Great job on the PR.';
    }

    let feedback = '🔍 **Code Review Results**\n\n';

    // Group by severity
    const bySeverity = {
      critical: state.allIssues.filter(i => i.severity === 'critical'),
      high: state.allIssues.filter(i => i.severity === 'high'),
      medium: state.allIssues.filter(i => i.severity === 'medium'),
      low: state.allIssues.filter(i => i.severity === 'low'),
    };

    // Critical issues
    if (bySeverity.critical.length > 0) {
      feedback += '### 🚨 Critical Issues\n\n';
      for (const issue of bySeverity.critical.slice(0, 5)) {
        feedback += this.formatIssue(issue);
      }
      if (bySeverity.critical.length > 5) {
        feedback += `\n_... and ${bySeverity.critical.length - 5} more critical issues_\n\n`;
      }
    }

    // High severity issues
    if (bySeverity.high.length > 0) {
      feedback += '### ⚠️ High Priority Issues\n\n';
      for (const issue of bySeverity.high.slice(0, 5)) {
        feedback += this.formatIssue(issue);
      }
      if (bySeverity.high.length > 5) {
        feedback += `\n_... and ${bySeverity.high.length - 5} more high priority issues_\n\n`;
      }
    }

    // Medium severity issues
    if (bySeverity.medium.length > 0) {
      feedback += '### ℹ️ Medium Priority Issues\n\n';
      for (const issue of bySeverity.medium.slice(0, 3)) {
        feedback += this.formatIssue(issue);
      }
      if (bySeverity.medium.length > 3) {
        feedback += `\n_... and ${bySeverity.medium.length - 3} more medium priority issues_\n\n`;
      }
    }

    feedback += `\n---\n\n**Summary:** ${state.allIssues.length} issue(s) found\n`;
    feedback += `- 🚨 Critical: ${bySeverity.critical.length}\n`;
    feedback += `- ⚠️ High: ${bySeverity.high.length}\n`;
    feedback += `- ℹ️ Medium: ${bySeverity.medium.length}\n`;
    feedback += `- 📌 Low: ${bySeverity.low.length}\n`;

    return feedback;
  }

  private formatIssue(issue: Issue): string {
    let formatted = `- **${issue.type}** (Line ${issue.lineNumber || 'N/A'} in \`${issue.filename || 'N/A'}\`)\n`;
    formatted += `  - **Issue:** ${issue.message}\n`;
    formatted += `  - **Suggestion:** ${issue.suggestion}\n\n`;
    return formatted;
  }
}

export const codeReviewAgent = new CodeReviewAgent();
