export enum ErrorCode {
  // Common Error
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INVALID_PARAMETER = "INVALID_PARAMETER",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",

  // Optimistic Lock Error
  OPTIMISTIC_LOCK_ERROR = "OPTIMISTIC_LOCK_ERROR",
  CONCURRENT_MODIFICATION = "CONCURRENT_MODIFICATION",

  // Auth Error
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_REVOKED = "TOKEN_REVOKED",
}

/**
 * Error Message
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Common
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  [ErrorCode.INVALID_PARAMETER]: "Invalid parameter",
  [ErrorCode.INTERNAL_SERVER_ERROR]: "Internal server error",

  // Auth
  [ErrorCode.INVALID_CREDENTIALS]: "Invalid credentials",
  [ErrorCode.EMAIL_ALREADY_EXISTS]: "Email already exists",
  [ErrorCode.INVALID_TOKEN]: "Invalid token",
  [ErrorCode.TOKEN_EXPIRED]: "Token expired",
  [ErrorCode.TOKEN_REVOKED]: "Token revoked",

  // Optimistic
  [ErrorCode.OPTIMISTIC_LOCK_ERROR]: "Optimistic lock error",
  [ErrorCode.CONCURRENT_MODIFICATION]: "Concurrent modification",
};
