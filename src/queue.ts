import Queue from 'bull';
import { config } from './config';
import { ReviewState } from './code-review-agent';

export const reviewQueue = new Queue('code-reviews', config.redis.url);

export interface ReviewJob {
  prNumber: number;
  repoOwner: string;
  repoName: string;
  commitSha: string;
  branch: string;
  baseBranch: string;
  author: string;
  title: string;
  body: string;
}

export async function queueReview(job: ReviewJob): Promise<void> {
  try {
    await reviewQueue.add(job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
    console.log(`Queued review for PR #${job.prNumber}`);
  } catch (error) {
    console.error('Failed to queue review:', error);
    throw error;
  }
}

export async function initializeQueueProcessors(
  handler: (job: ReviewJob) => Promise<void>
): Promise<void> {
  reviewQueue.process(10, async (job) => {
    try {
      console.log(`Processing review job for PR #${job.data.prNumber}`);
      await handler(job.data);
      return { success: true };
    } catch (error) {
      console.error(`Failed to process review job:`, error);
      throw error;
    }
  });

  reviewQueue.on('completed', (job) => {
    console.log(`Review completed for PR #${job.data.prNumber}`);
  });

  reviewQueue.on('failed', (job, err) => {
    console.error(`Review failed for PR #${job.data.prNumber}:`, err);
  });

  console.log('Queue processors initialized');
}

export async function getQueueStats() {
  const counts = await reviewQueue.getJobCounts();
  return counts;
}
