import fs from 'fs';
import path from 'path';

const demoDir = path.resolve(__dirname, '..', 'demo');
const markdownFile = path.join(demoDir, 'pr-review-preview.md');
const htmlFile = path.join(demoDir, 'index.html');

const preview = `# Agentic Code Reviewer Demo Preview

This preview is intended for screenshots, repository showcase pages, and public-facing README assets.

## Review Summary

### Security Findings
- Hardcoded secret pattern detected in configuration file.
- SQL query assembled from request input.
- Inline HTML rendering could introduce XSS risk.

### Performance Findings
- Nested loop pattern detected in data processing logic.
- Potential N+1 query pattern in repository access layer.

### Architecture Findings
- Tight coupling between service and request handler.
- Complex function likely to grow into a god object.

## Suggested Fixes
1. Move secrets to environment variables or a secret manager.
2. Use parameterized query helpers for database access.
3. Replace unsafe HTML injection with a sanitization layer.
4. Extract repeated logic into helper routines and reduce loop depth.

## Status

Demo generated successfully for public-facing preview use.
`;

const htmlPreview = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agentic Code Reviewer Preview</title>
    <style>
      :root {
        --bg: #0f172a;
        --panel: #111827;
        --panel-alt: #1f2937;
        --border: rgba(148, 163, 184, 0.2);
        --text: #e5e7eb;
        --muted: #94a3b8;
        --green: #22c55e;
        --amber: #f59e0b;
        --red: #f87171;
        --blue: #60a5fa;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: Inter, "Segoe UI", sans-serif;
        background: linear-gradient(135deg, #020817, #0f172a 40%, #111827);
        color: var(--text);
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
      }

      .shell {
        width: min(1100px, 100%);
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: 0 30px 80px rgba(15, 23, 42, 0.7);
        overflow: hidden;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 28px;
        border-bottom: 1px solid var(--border);
        background: rgba(15, 23, 42, 0.7);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .brand-mark {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--green), var(--blue));
        box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.15);
      }

      .status {
        color: var(--green);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .content {
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 24px;
        padding: 28px;
      }

      .panel {
        background: rgba(17, 24, 39, 0.9);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 22px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 2.1rem;
      }

      h2 {
        margin: 0 0 12px;
        font-size: 1.1rem;
        color: var(--muted);
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .summary {
        margin: 0 0 22px;
        color: var(--muted);
        line-height: 1.6;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 18px;
      }

      .metric {
        background: rgba(31, 41, 55, 0.9);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
      }

      .metric .label {
        display: block;
        color: var(--muted);
        margin-bottom: 8px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .metric .value {
        font-size: 2rem;
        font-weight: 700;
      }

      .issue-list {
        display: grid;
        gap: 12px;
      }

      .issue {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px 14px;
      }

      .badge {
        min-width: 72px;
        text-align: center;
        padding: 6px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .badge.security { background: rgba(248, 113, 113, 0.12); color: var(--red); }
      .badge.performance { background: rgba(245, 158, 11, 0.12); color: var(--amber); }
      .badge.architecture { background: rgba(96, 165, 250, 0.12); color: var(--blue); }

      .issue strong {
        display: block;
        margin-bottom: 4px;
      }

      .issue p {
        margin: 0;
        color: var(--muted);
        line-height: 1.5;
      }

      .side-card {
        display: grid;
        gap: 16px;
      }

      .tiny-label {
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }

      .mini-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 10px;
      }

      .mini-list li {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: var(--text);
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        padding-bottom: 8px;
      }

      .mini-list span:last-child {
        color: var(--muted);
      }

      .cta {
        margin-top: 10px;
        padding: 12px 14px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(96, 165, 250, 0.15));
        border: 1px solid rgba(96, 165, 250, 0.2);
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="topbar">
        <div class="brand">
          <span class="brand-mark"></span>
          <span>Agentic Code Reviewer</span>
        </div>
        <div class="status">Live review preview</div>
      </div>

      <div class="content">
        <section class="panel">
          <h2>Review summary</h2>
          <h1>Pull request findings</h1>
          <p class="summary">
            Automated checks across security, performance, and architecture patterns highlight the most likely risks before merge.
          </p>

          <div class="metrics">
            <div class="metric">
              <span class="label">Security</span>
              <span class="value">3</span>
            </div>
            <div class="metric">
              <span class="label">Performance</span>
              <span class="value">2</span>
            </div>
            <div class="metric">
              <span class="label">Architecture</span>
              <span class="value">2</span>
            </div>
          </div>

          <div class="issue-list">
            <div class="issue">
              <span class="badge security">Security</span>
              <div>
                <strong>Hardcoded secret pattern</strong>
                <p>Possible API token found in app configuration. Move it to a secure secret store.</p>
              </div>
            </div>
            <div class="issue">
              <span class="badge performance">Performance</span>
              <div>
                <strong>Nested loop hotspot</strong>
                <p>Repeated iteration can degrade throughput on larger payloads.</p>
              </div>
            </div>
            <div class="issue">
              <span class="badge architecture">Architecture</span>
              <div>
                <strong>Tight coupling</strong>
                <p>Controller and service logic are too closely tied, which makes reuse harder.</p>
              </div>
            </div>
          </div>
        </section>

        <aside class="side-card">
          <div class="panel">
            <div class="tiny-label">Detected patterns</div>
            <ul class="mini-list">
              <li><span>SQL injection risk</span><span>Medium</span></li>
              <li><span>Unsafe HTML rendering</span><span>High</span></li>
              <li><span>N+1 query chain</span><span>Medium</span></li>
              <li><span>Circular dependency</span><span>Low</span></li>
            </ul>
          </div>

          <div class="panel">
            <div class="tiny-label">Recommended fixes</div>
            <ul class="mini-list">
              <li><span>Move secrets to env</span><span>1</span></li>
              <li><span>Use parameterized SQL</span><span>2</span></li>
              <li><span>Refactor complex functions</span><span>3</span></li>
              <li><span>Extract shared helpers</span><span>4</span></li>
            </ul>
            <div class="cta">Public README preview ready for screenshots</div>
          </div>
        </aside>
      </div>
    </div>
  </body>
</html>
`;

if (!fs.existsSync(demoDir)) {
  fs.mkdirSync(demoDir, { recursive: true });
}

fs.writeFileSync(markdownFile, preview, 'utf8');
fs.writeFileSync(htmlFile, htmlPreview, 'utf8');

console.log(`Demo preview generated at ${markdownFile}`);
console.log(`HTML demo preview generated at ${htmlFile}`);
console.log('Use the HTML page for README screenshots and public showcase materials.');
