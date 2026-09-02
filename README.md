# Agentic Code Reviewer

> A self-hosted TypeScript GitHub pull request code review bot that analyzes changed code for security vulnerabilities, performance risks, and architecture problems—and posts actionable Markdown feedback directly on the pull request.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub Webhooks](https://img.shields.io/badge/GitHub-Webhooks-181717?logo=github&logoColor=white)](https://docs.github.com/en/webhooks)
[![Tests](https://img.shields.io/badge/tests-Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Agentic Code Reviewer is an open-source, self-hosted automated code review tool for GitHub pull requests. It receives GitHub webhook events, fetches the pull request diff, runs fast heuristic static analysis, stores review history in PostgreSQL, and uses Redis/Bull for asynchronous processing.

If you are looking for a **GitHub code review bot**, **automated pull request security scanner**, or a lightweight **DevSecOps code quality tool**, this project is designed to be easy to extend and run in your own infrastructure.

⭐ If this project helps your team, please [star the repository](https://github.com/Srameshgitnow/agentic-code-reviewer) and share it with other developers. Stars help prioritize improvements and make the project easier to discover.

## Why use it?

- Review pull requests automatically without sending source code to a third-party SaaS.
- Catch common security mistakes before they reach production.
- Surface performance and maintainability risks while changes are still easy to fix.
- Keep an auditable history of reviews and findings in PostgreSQL.
- Process webhook requests quickly with a Redis-backed Bull queue.
- Extend the TypeScript analyzers with project-specific rules.

## Features

| Analyzer | What it checks |
| --- | --- |
| Security | Hardcoded secrets, SQL injection patterns, XSS sinks, unsafe deserialization, and missing input validation |
| Performance | N+1 database queries, nested query loops, inefficient array lookups, and allocations inside loops |
| Architecture | Possible circular dependencies, tight coupling, complex functions, repeated logic, and missing async error handling |
| GitHub integration | HMAC-verified pull request webhooks, diff retrieval, and Markdown comments |
| Operations | PostgreSQL persistence, Redis/Bull retries, health endpoint, and configurable logging |

## How it works

1. GitHub sends an `opened` or `synchronize` pull request webhook.
2. The server verifies the `X-Hub-Signature-256` signature.
3. The review is queued so GitHub receives a fast response.
4. The worker downloads the diff and analyzes added lines.
5. Findings are saved and posted to the pull request as Markdown feedback.

## Current scope

This project currently uses deterministic pattern matching and heuristics. It does **not** yet use an LLM or LangGraph workflow. Findings are suggestions for review, not proof of a vulnerability; always validate results with your normal security and testing processes.

Only added lines in recognized source files are analyzed. Supported language detection includes TypeScript, JavaScript, Python, Java, C#, Go, Ruby, PHP, SQL, HTML, CSS, JSON, and YAML.

## Quick start

### Prerequisites

- Node.js 16 or newer
- PostgreSQL 12 or newer
- Redis 6 or newer
- A GitHub token with permission to read pull requests and write pull request comments
- A publicly reachable HTTPS URL for GitHub webhooks in production

### Install and build

```bash
git clone https://github.com/Srameshgitnow/agentic-code-reviewer.git
cd agentic-code-reviewer
npm install
copy .env.example .env
npm run build
npm start
```

On macOS/Linux, replace the `copy` command with `cp .env.example .env`. The server listens on port `3000` by default.

For local TypeScript development, use `npm run dev`. PostgreSQL and Redis must be running before starting the server.

## Configuration

Copy `.env.example` to `.env` and set the values for your environment:

```env
NODE_ENV=development
PORT=3000
WEBHOOK_PATH=/webhook
GITHUB_WEBHOOK_SECRET=replace-with-a-random-secret
GITHUB_TOKEN=ghp_your_token
GITHUB_APP_ID=12345
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=code_reviewer
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

The `OPENAI_API_KEY` and `LLM_MODEL` settings are reserved for planned LLM-assisted analysis and are not used by the current implementation.

## Configure a GitHub webhook

1. Open **Repository settings → Webhooks → Add webhook**.
2. Set the **Payload URL** to `https://your-domain.example/webhook`.
3. Choose **application/json** as the content type.
4. Set the same random value in **Secret** and `GITHUB_WEBHOOK_SECRET`.
5. Select **Let me select individual events**, enable **Pull requests**, and save.

The health check is available at `GET /health`. The webhook endpoint is configurable with `WEBHOOK_PATH`.

## Example review feedback

```text
Code Review Results

Critical Issues
- hardcoded_secret (Line 42 in src/config.ts)
  Issue: A possible hardcoded API key was detected.
  Suggestion: Move secrets to environment variables or a secrets manager.
```

## API endpoints

### `POST /webhook`

Receives verified GitHub pull request events and queues supported reviews.

### `GET /health`

Returns the service status and current timestamp.

### `GET /stats`

Reserved endpoint for queue statistics. Detailed queue metrics are planned.

## Project structure

```text
src/
├── index.ts                 Express server and webhook orchestration
├── github-webhook.ts        Signature verification and event parsing
├── github-api.ts            GitHub REST API client
├── code-analyzer.ts         Unified diff parser and language detection
├── security-analyzer.ts     Security heuristics
├── performance-analyzer.ts  Performance heuristics
├── architecture-analyzer.ts Architecture heuristics
├── code-review-agent.ts     Review orchestration and Markdown output
├── queue.ts                 Redis/Bull job processing
└── database.ts              PostgreSQL persistence
```

## Development

```bash
npm test                 # Run the Jest test suite
npm test -- --coverage   # Generate coverage output
npm run build            # Compile TypeScript
npm run lint             # Run ESLint when configured
```

Contributions are welcome. Please open an issue for a bug or feature proposal, then submit a focused pull request with tests where practical.

## Roadmap

- Add a local diff/CLI mode for trying the analyzers without GitHub, PostgreSQL, or Redis.
- Add Docker Compose for one-command local deployment.
- Add configurable repository-specific rules and severity thresholds.
- Improve false-positive reporting and test coverage.
- Add optional LLM-assisted explanations behind an explicit opt-in.
- Add GitHub Actions support and richer queue metrics.

## Security

Never commit `.env`, GitHub tokens, webhook secrets, or database credentials. Report security issues privately through the repository's GitHub security contact rather than posting sensitive details publicly.

## License

MIT. See [LICENSE](LICENSE).

## Public project notes

This repository is prepared for professional public presentation and practical use in a developer workflow.

- Keep local credentials in a private `.env` file only; the repository intentionally ignores them.
- Do not commit tokens, webhook secrets, or generated credentials.
- This project is documented as a heuristic-based static analysis tool unless an LLM workflow is explicitly added.
- For public visibility, use a clear GitHub description, relevant repository topics, and a concise product summary in the repository settings.

## Support the project

Found this useful? [Star Agentic Code Reviewer](https://github.com/Srameshgitnow/agentic-code-reviewer), open an issue with feedback, or contribute a new analyzer rule. Every star helps other teams discover this open-source GitHub pull request review bot.
