# Agentic Code Reviewer

An AI-powered GitHub pull request code review bot that detects security vulnerabilities, performance issues, and architecture problems using intelligent pattern analysis.

## 🎯 Features

- **🔐 Security Analysis**: Detects hardcoded secrets, SQL injection, XSS, and more
- **⚡ Performance Analysis**: Identifies N+1 queries, inefficient loops, and memory issues
- **🏗️ Architecture Analysis**: Flags tight coupling, circular dependencies, god objects
- **🔄 Async Processing**: Non-blocking webhook handling with job queue
- **📊 Review Tracking**: PostgreSQL storage for audit trail and metrics
- **🤖 Scalable**: Bull/Redis queue for handling high volume

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Redis 6+
- GitHub Token

### Installation

```bash
# Clone repository
git clone <your-repo>
cd agentic-code-reviewer

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Build
npm run build

# Start
npm start
```

Server runs on `http://localhost:3000` by default.

## 📋 Configuration

Set these environment variables in `.env`:

```env
# Server
NODE_ENV=development
PORT=3000

# GitHub
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_APP_ID=12345

# LLM (Optional for future enhancement)
OPENAI_API_KEY=sk-xxxxxxxx
LLM_MODEL=gpt-4

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=code_reviewer

# Redis
REDIS_URL=redis://localhost:6379
```

## 🔌 GitHub Webhook Setup

1. Go to your GitHub repository Settings → Webhooks
2. Click "Add webhook"
3. Set Payload URL: `https://your-domain.com/webhook`
4. Set Secret: Use the value from `GITHUB_WEBHOOK_SECRET`
5. Content type: `application/json`
6. Events: Select "Pull requests"
7. Active: ✓ Check

## 📁 Project Structure

```
src/
├── index.ts                    Main server
├── config.ts                   Configuration
├── database.ts                 PostgreSQL setup
├── github-webhook.ts           Webhook verification
├── github-api.ts              GitHub API client
├── code-analyzer.ts           Diff parsing
├── code-review-agent.ts       Review orchestration
├── security-analyzer.ts       Security checks
├── performance-analyzer.ts    Performance checks
├── architecture-analyzer.ts   Architecture checks
├── feedback-formatter.ts      Markdown formatting
├── queue.ts                   Job queue
└── env.d.ts                   TypeScript definitions
```

## 🔍 Analysis Types

### Security Issues
- Hardcoded secrets (API keys, passwords, tokens)
- SQL injection vulnerabilities
- Cross-Site Scripting (XSS) vulnerabilities
- Missing input validation
- Insecure deserialization

### Performance Issues
- N+1 query problems
- Expensive nested loops
- Missing memoization opportunities
- Inefficient data structures
- Object creation in loops

### Architecture Issues
- Circular dependencies
- Tight coupling
- God objects/functions
- Missing abstractions
- Poor error handling

## 📊 Review Output Example

The bot posts reviews formatted as:

```markdown
# 🔍 Code Review Report

## 🚨 Critical Issues

### hardcoded_secret
- **File:** src/config.ts
- **Line:** 42
- **Issue:** Hardcoded API key detected
- **Suggestion:** Use environment variables or AWS Secrets Manager

## ⚠️ High Priority Issues

### sql_injection
- **File:** src/database.ts
- **Line:** 18
- **Issue:** Potential SQL injection vulnerability
- **Suggestion:** Use parameterized queries with proper escaping

---

## Summary
**Total Issues Found:** 5
- 🚨 Critical: 1
- ⚠️ High: 2
- ℹ️ Medium: 2
- 📌 Low: 0
```

## API Endpoints

### POST `/webhook`
Receives GitHub PR events.

**Headers:**
```
Content-Type: application/json
X-Hub-Signature-256: sha256=...
```

**Response:**
```json
{
  "message": "Review queued successfully",
  "pr": 123
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🗄️ Database Schema

### reviews
Stores review metadata for each PR:
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  repo_owner VARCHAR(255),
  repo_name VARCHAR(255),
  pr_number INTEGER,
  commit_sha VARCHAR(255),
  reviewed_at TIMESTAMP,
  security_issues INTEGER,
  performance_issues INTEGER,
  comment_id BIGINT,
  comment_body TEXT
);
```

### code_issues
Stores individual issues found:
```sql
CREATE TABLE code_issues (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id),
  issue_type VARCHAR(50),
  severity VARCHAR(20),
  file_name VARCHAR(255),
  line_number INTEGER,
  message TEXT,
  suggestion TEXT
);
```

### repo_config
Configuration per repository:
```sql
CREATE TABLE repo_config (
  id SERIAL PRIMARY KEY,
  repo_owner VARCHAR(255),
  repo_name VARCHAR(255),
  check_security BOOLEAN DEFAULT true,
  check_performance BOOLEAN DEFAULT true,
  check_architecture BOOLEAN DEFAULT true
);
```

## 🔄 Workflow

```
1. Developer opens PR on GitHub
    ↓
2. GitHub sends webhook to /webhook
    ↓
3. Server verifies HMAC signature
    ↓
4. Extract PR metadata & diff
    ↓
5. Queue async review job (return 200 OK)
    ↓
6. Background job processes:
    - Parse diff
    - Run security analysis
    - Run performance analysis
    - Run architecture analysis
    - Generate feedback
    - Save to database
    - Post comment on PR
    ↓
7. Developer sees review on PR
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint
```

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Local development setup
- Docker deployment
- AWS EC2 deployment
- Heroku deployment
- Production configuration
- Monitoring & logging

## 🔐 Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Strong GitHub token permissions
- [ ] Secure webhook secret
- [ ] Database backups
- [ ] Environment variables protected
- [ ] Rate limiting configured
- [ ] Monitoring alerts active

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📖 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design and data flow
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [CODE_GENERATION_SUMMARY.md](CODE_GENERATION_SUMMARY.md) - Code structure overview
- [BLOG_OUTLINE.md](BLOG_OUTLINE.md) - Blog articles planned

## 🚀 Future Enhancements

- [ ] OpenAI/Claude integration for nuanced analysis
- [ ] Custom rule engine for repos
- [ ] Machine learning for false positive reduction
- [ ] Web dashboard for review history
- [ ] Metrics and trends analysis
- [ ] GitHub App marketplace listing
- [ ] VS Code extension
- [ ] Slack integration

## 🐛 Troubleshooting

### Webhook not triggering
- Check GitHub webhook delivery logs
- Verify HMAC signature matches
- Ensure server is publicly accessible
- Check firewall rules

### Database connection issues
```bash
psql -U postgres -h localhost -d code_reviewer
```

### Redis connection issues
```bash
redis-cli ping
# Should return: PONG
```

### High CPU usage
- Check queue backlog size
- Increase worker count
- Upgrade server resources

## 📝 License

MIT License - see LICENSE file

## 💡 Author Notes

This is a production-ready code review bot that combines:
- **Pattern-based detection** for fast, reliable checks
- **Intelligent parsing** of diffs and code
- **Async architecture** for scalability
- **Database persistence** for audit trail

The system is extensible and can easily incorporate LLM reasoning later for more nuanced analysis.

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the deployment guide
 - If you find this project useful, please consider giving it a star on GitHub and sharing it with your colleagues or community.

---

**Made with ❤️ for better code quality**
