import express, { Request, Response } from 'express';
import { config } from './config';
import { initializeDatabase } from './database';
import { verifyGitHubSignature, extractPRData, GitHubPREvent } from './github-webhook';
import { githubAPI } from './github-api';
import { codeAnalyzer } from './code-analyzer';
import { codeReviewAgent } from './code-review-agent';
import { saveReview, saveCodeIssue } from './database';
import { queueReview, initializeQueueProcessors, ReviewJob } from './queue';
import type { Issue } from './code-review-agent';

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook endpoint
app.post(config.server.webhookPath, verifyGitHubSignature, async (req: Request, res: Response) => {
  try {
    const event = req.body as GitHubPREvent;

    // Only process PR opened and synchronize events
    if (!['opened', 'synchronize'].includes(event.action)) {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const prData = extractPRData(event);
    console.log(`Received PR event for ${prData.repoFullName}#${prData.prNumber}`);

    // Queue the review asynchronously
    const reviewJob: ReviewJob = {
      prNumber: prData.prNumber,
      repoOwner: prData.repoOwner,
      repoName: prData.repoName,
      commitSha: prData.commitSha,
      branch: prData.branch,
      baseBranch: prData.baseBranch,
      author: prData.author,
      title: prData.title,
      body: prData.body,
    };

    await queueReview(reviewJob);

    // Return 200 OK immediately
    res.status(200).json({ message: 'Review queued successfully', pr: prData.prNumber });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize queue processors
async function setupQueueProcessors() {
  await initializeQueueProcessors(async (job: ReviewJob) => {
    try {
      console.log(`Starting review for ${job.repoOwner}/${job.repoName}#${job.prNumber}`);

      // Get the diff from GitHub
      const diff = await githubAPI.getPullRequestDiff(job.repoOwner, job.repoName, job.prNumber);

      // Analyze the code
      const files = codeAnalyzer.parseDiff(diff);
      console.log(`Parsed ${files.length} files from diff`);

      // Run the review agent
      const reviewState = {
        files,
        prNumber: job.prNumber,
        repoOwner: job.repoOwner,
        repoName: job.repoName,
        commitSha: job.commitSha,
        securityIssues: [],
        performanceIssues: [],
        architectureIssues: [],
        allIssues: [],
        feedback: '',
      };

      await codeReviewAgent.runReview(reviewState);
      const feedback = await codeReviewAgent.generateFeedback(reviewState);

      // Save review to database
      const review = await saveReview({
        repo_owner: job.repoOwner,
        repo_name: job.repoName,
        pr_number: job.prNumber,
        commit_sha: job.commitSha,
        security_issues: reviewState.securityIssues.length,
        performance_issues: reviewState.performanceIssues.length,
        comment_id: null,
        comment_body: feedback,
      });

      // Save individual issues
      for (const issue of reviewState.allIssues as Issue[]) {
        await saveCodeIssue({
          review_id: review.id,
          issue_type: issue.type,
          severity: issue.severity,
          file_name: issue.filename || '',
          line_number: issue.lineNumber || 0,
          message: issue.message,
          suggestion: issue.suggestion,
        });
      }

      // Post comment on PR
      const commentId = await githubAPI.postComment(
        job.repoOwner,
        job.repoName,
        job.prNumber,
        feedback
      );

      // Update review with comment ID
      await saveReview({
        repo_owner: job.repoOwner,
        repo_name: job.repoName,
        pr_number: job.prNumber,
        commit_sha: job.commitSha,
        security_issues: reviewState.securityIssues.length,
        performance_issues: reviewState.performanceIssues.length,
        comment_id: commentId,
        comment_body: feedback,
      });

      console.log(`Review posted on PR #${job.prNumber}`);
    } catch (error) {
      console.error('Review processing error:', error);
      throw error;
    }
  });
}

// Statistics endpoint
app.get('/stats', async (req: Request, res: Response) => {
  try {
    // This would be implemented with actual queue stats
    res.json({ message: 'Queue stats endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
async function start() {
  try {
    console.log('Initializing Agentic Code Reviewer...');

    // Initialize database
    await initializeDatabase();

    // Setup queue processors
    await setupQueueProcessors();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Webhook endpoint: http://localhost:${config.port}${config.server.webhookPath}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

start();
