# Architecture

## Overview

Agentic Code Reviewer is a self-hosted TypeScript service that listens to GitHub pull request events, analyzes code diffs for risk patterns, stores review metadata, and posts summarized feedback back to the repository as a pull request comment.

The system is designed to be simple, auditable, and easy to extend while staying within a low-cost production footprint.

## High-level flow

```text
GitHub PR Event
      ↓
Express webhook endpoint
      ↓
Signature validation
      ↓
Bull/Redis queue
      ↓
Diff retrieval via GitHub API
      ↓
Code diff parsing
      ↓
Security + performance + architecture analyzers
      ↓
Review aggregation and Markdown formatter
      ↓
PostgreSQL persistence
      ↓
PR comment publication
```

## Components

### 1. HTTP entrypoint
The Express application in `src/index.ts` exposes the public HTTP endpoints:

- `GET /health` for status checks
- `POST /webhook` to receive PR events
- `GET /stats` for queue-related status information

This service validates incoming payloads and immediately enqueues review work so the webhook response remains fast.

### 2. GitHub webhook layer
The webhook logic in `src/github-webhook.ts` verifies the HMAC signature using the shared secret and extracts relevant PR metadata such as repository, number, branch, author, commit SHA, title, and body.

### 3. Queue and async processing
The queue in `src/queue.ts` uses Redis/Bull to decouple webhook ingestion from analysis.

Benefits:

- Webhook handlers respond quickly
- Large review traffic is easier to manage
- Worker retries and backoff are supported
- Processing can be scaled independently

### 4. GitHub API client
The GitHub API client in `src/github-api.ts` fetches the pull request diff and posts review comments back to the corresponding PR.

### 5. Diff parsing and language detection
`src/code-analyzer.ts` parses Git diff text and tracks:

- added lines
- removed lines
- file-level metadata
- detected language
- change counts

This forms the input model for all downstream analyzers.

### 6. Analyzers
The system currently includes three detection layers:

#### Security analyzer
`src/security-analyzer.ts`

Detects patterns like:

- hardcoded secrets
- SQL injection indicators
- XSS sinks
- unsafe deserialization
- missing validation patterns

#### Performance analyzer
`src/performance-analyzer.ts`

Detects patterns like:

- N+1 patterns
- nested loops with query-like operations
- repeated lookups that may benefit from Sets/Maps
- object or array creation in loops

#### Architecture analyzer
`src/architecture-analyzer.ts`

Looks for approximate signs of:

- tight coupling
- god functions
- repeated logic
- circular dependency indicators
- async flows without error handling

### 7. Review orchestration
The `CodeReviewAgent` in `src/code-review-agent.ts` combines the findings from all analyzers, sorts them by severity, and produces a Markdown review summary.

### 8. Database persistence
The PostgreSQL layer in `src/database.ts` stores:

- review metadata
- individual code issues
- repository configuration

This gives an audit record for each PR review and makes the system easier to integrate with later dashboards or reporting tools.

## Data model

The core tables include:

- `reviews`
- `code_issues`
- `repo_config`

These tables allow tracking of PR-level review state and detailed issue records per inspection.

## Production notes

This architecture is intentionally straightforward for a public project because it improves maintainability and transparency.

For a production deployment, consider:

- securing the webhook endpoint behind HTTPS
- restricting GitHub token permissions
- using managed Redis and PostgreSQL
- adding rate limiting and observability
- adding a dashboard or metrics layer later

## Design limitations

The project is currently a heuristic analyzer rather than a true LLM-powered reviewer. That means it is best positioned as:

- a fast, rule-based PR reviewer
- a security and quality guardrail
- a foundation for future AI enhancements

## Future extension paths

Possible next steps include:

- opt-in LLM explanation layer
- custom repo-specific rules
- richer metrics dashboards
- GitHub App integration
- local diff CLI mode
