import { Pool, QueryResult } from 'pg';
import { config } from './config';

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('Database connected successfully');
      client.release();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    return this.pool.query(text, params);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = new Database();

export interface Review {
  id: number;
  repo_owner: string;
  repo_name: string;
  pr_number: number;
  commit_sha: string;
  reviewed_at: Date;
  security_issues: number;
  performance_issues: number;
  comment_id: number | null;
  comment_body: string;
}

export interface CodeIssue {
  id: number;
  review_id: number;
  issue_type: string;
  severity: string;
  file_name: string;
  line_number: number;
  message: string;
  suggestion: string;
}

export async function initializeDatabase(): Promise<void> {
  await db.connect();

  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      repo_owner VARCHAR(255) NOT NULL,
      repo_name VARCHAR(255) NOT NULL,
      pr_number INTEGER NOT NULL,
      commit_sha VARCHAR(255) NOT NULL,
      reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      security_issues INTEGER DEFAULT 0,
      performance_issues INTEGER DEFAULT 0,
      comment_id BIGINT,
      comment_body TEXT
    );

    CREATE TABLE IF NOT EXISTS code_issues (
      id SERIAL PRIMARY KEY,
      review_id INTEGER NOT NULL REFERENCES reviews(id),
      issue_type VARCHAR(50),
      severity VARCHAR(20),
      file_name VARCHAR(255),
      line_number INTEGER,
      message TEXT,
      suggestion TEXT
    );

    CREATE TABLE IF NOT EXISTS repo_config (
      id SERIAL PRIMARY KEY,
      repo_owner VARCHAR(255) NOT NULL,
      repo_name VARCHAR(255) NOT NULL,
      check_security BOOLEAN DEFAULT true,
      check_performance BOOLEAN DEFAULT true,
      check_architecture BOOLEAN DEFAULT true
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_pr ON reviews(repo_owner, repo_name, pr_number);
    CREATE INDEX IF NOT EXISTS idx_code_issues_review ON code_issues(review_id);
  `;

  try {
    for (const sql of createTablesSQL.split(';').filter(s => s.trim())) {
      await db.query(sql);
    }
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    throw error;
  }
}

export async function saveReview(review: Omit<Review, 'id' | 'reviewed_at'>): Promise<Review> {
  const result = await db.query(
    `INSERT INTO reviews (repo_owner, repo_name, pr_number, commit_sha, security_issues, performance_issues, comment_id, comment_body)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [review.repo_owner, review.repo_name, review.pr_number, review.commit_sha, 
     review.security_issues, review.performance_issues, review.comment_id, review.comment_body]
  );
  return result.rows[0];
}

export async function saveCodeIssue(issue: Omit<CodeIssue, 'id'>): Promise<CodeIssue> {
  const result = await db.query(
    `INSERT INTO code_issues (review_id, issue_type, severity, file_name, line_number, message, suggestion)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [issue.review_id, issue.issue_type, issue.severity, issue.file_name, 
     issue.line_number, issue.message, issue.suggestion]
  );
  return result.rows[0];
}

export async function getReviewsByPR(repoOwner: string, repoName: string, prNumber: number): Promise<Review[]> {
  const result = await db.query(
    `SELECT * FROM reviews WHERE repo_owner = $1 AND repo_name = $2 AND pr_number = $3`,
    [repoOwner, repoName, prNumber]
  );
  return result.rows;
}

export async function getCodeIssuesByReview(reviewId: number): Promise<CodeIssue[]> {
  const result = await db.query(
    `SELECT * FROM code_issues WHERE review_id = $1`,
    [reviewId]
  );
  return result.rows;
}
