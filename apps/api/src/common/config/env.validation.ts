import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  // Node Environment
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  // Database
  DATABASE_URL: Joi.string().required(),

  // JWT - Access Token
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_MS: Joi.number().default(3600000), // 1시간

  // JWT - Refresh Token
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_MS: Joi.number().default(604800000), // 7일
});
