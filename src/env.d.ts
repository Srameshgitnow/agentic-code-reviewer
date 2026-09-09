export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;

      // GitHub
      GITHUB_WEBHOOK_SECRET: string;
      GITHUB_TOKEN: string;
      GITHUB_APP_ID: string;

      // LLM
      LLM_PROVIDER: string;
      OPENAI_API_KEY: string;
      ANTHROPIC_API_KEY: string;
      CLAUDE_API_KEY: string;
      LLM_MODEL: string;

      // Database
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;

      // Redis
      REDIS_URL: string;

      // Server
      WEBHOOK_PATH: string;
      LOG_LEVEL: string;
    }
  }
}
