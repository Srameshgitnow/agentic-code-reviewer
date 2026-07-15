import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';

export function verifyGitHubSignature(req: Request, res: Response, next: NextFunction): void {
  const signature = req.headers['x-hub-signature-256'] as string;
  
  if (!signature) {
    res.status(401).json({ error: 'Missing signature header' });
    return;
  }

  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', config.github.webhookSecret)
    .update(body)
    .digest('hex');

  const expectedSignature = `sha256=${hash}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  next();
}

export interface GitHubPREvent {
  action: string;
  pull_request: {
    number: number;
    title: string;
    body: string;
    head: {
      sha: string;
      ref: string;
      repo: {
        name: string;
        owner: {
          login: string;
        };
      };
    };
    base: {
      ref: string;
    };
    user: {
      login: string;
    };
  };
  repository: {
    name: string;
    owner: {
      login: string;
    };
    full_name: string;
  };
}

export function extractPRData(event: GitHubPREvent) {
  return {
    action: event.action,
    prNumber: event.pull_request.number,
    title: event.pull_request.title,
    body: event.pull_request.body,
    commitSha: event.pull_request.head.sha,
    branch: event.pull_request.head.ref,
    repoName: event.repository.name,
    repoOwner: event.repository.owner.login,
    repoFullName: event.repository.full_name,
    baseBranch: event.pull_request.base.ref,
    author: event.pull_request.user.login,
  };
}
