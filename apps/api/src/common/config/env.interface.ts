/**
 * 환경변수 타입 정의
 */
export interface EnvironmentVariables {
  // Node Environment
  NODE_ENV: "development" | "production" | "test";

  // Database
  DATABASE_URL: string;

  // JWT - Access Token
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRATION_MS: number;

  // JWT - Refresh Token
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_EXPIRATION_MS: number;
}
