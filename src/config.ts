import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  github: {
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
    token: process.env.GITHUB_TOKEN!,
    appId: process.env.GITHUB_APP_ID!,
  },
  
  llm: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.LLM_MODEL || 'gpt-4',
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'code_reviewer',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  server: {
    webhookPath: process.env.WEBHOOK_PATH || '/webhook',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'GITHUB_WEBHOOK_SECRET',
  'GITHUB_TOKEN',
  'OPENAI_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set in environment variables`);
  }
}
