# Security Policy

## Reporting a vulnerability

Please do not report security issues publicly through issues or pull requests.

Instead, contact the maintainer privately through the GitHub security reporting flow or a secure email channel if one is configured.

Provide:

- a clear description of the issue
- affected files or routes
- reproduction steps if applicable
- impact assessment
- suggested fix if available

## Protecting local secrets

- Keep credentials only in a local `.env` file.
- Do not commit `.env` files or tokens.
- Rotate exposed tokens immediately if they ever appear in commits or logs.
- Use environment variables or a secret manager in deployment.

## Supported vulnerability model

This project is a heuristic static analysis tool and not a guaranteed security scanner. Findings should be treated as review suggestions rather than definitive exploit proofs unless validated with repository-specific testing.
