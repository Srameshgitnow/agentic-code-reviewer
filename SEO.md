# Repository SEO and Discovery Guide

This document records the search and discovery strategy for Agentic Code Reviewer so future changes keep the repository easy to find and easy to trust.

## Primary search intent

The project should naturally target these phrases:

- GitHub pull request code review bot
- automated code review for GitHub
- self-hosted GitHub code review tool
- pull request security scanner
- TypeScript static analysis tool
- DevSecOps security and performance checks
- GitHub webhook code reviewer

Use these terms in meaningful documentation, examples, issue titles, and release notes. Do not keyword-stuff README text or make claims that the implementation does not support.

## GitHub repository settings

Keep the following metadata aligned with the README:

- **Description:** Self-hosted TypeScript GitHub pull request code review bot for security, performance, and architecture analysis.
- **Topics:** `github-bot`, `github-webhook`, `pull-request`, `code-review`, `automated-code-review`, `static-analysis`, `security-scanner`, `devsecops`, `typescript`, `postgresql`, `redis`, `developer-tools`.
- **Social preview:** Use a 1280×640 image showing the product name, “Automated GitHub PR Code Review”, and the three analyzer categories.
- **Homepage:** Point to the README or a live demo when one exists.

## Content that improves star conversion

1. Keep the first paragraph outcome-focused and accurate.
2. Show a real pull request comment or short recording near the top.
3. Provide a copy-paste setup path and clearly list required services.
4. Add a small sample repository or fixture diff so visitors can try the analyzers quickly.
5. Publish releases with concise notes describing user-visible improvements.
6. Link related discussions, issues, and contribution opportunities from the README.
7. Ask for a star only after explaining the value, and use the request sparingly.

## Trust and quality checklist

- Keep package metadata, README, and implementation claims consistent.
- Document false positives and analysis limitations.
- Never include real credentials in examples.
- Keep screenshots and badges current.
- Add CI status and coverage badges after a GitHub Actions workflow is available.
- Add a changelog when the first public release is published.

## Suggested future pages

- `docs/demo.md`: annotated example pull request and review output.
- `docs/rules.md`: complete analyzer rule catalog with examples.
- `docs/deployment.md`: Docker Compose and production deployment instructions.
- `CHANGELOG.md`: release history and upgrade notes.
