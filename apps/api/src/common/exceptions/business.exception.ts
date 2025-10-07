import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode, ErrorMessages } from "../types/error.type";

export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    // biome-ignore lint/suspicious/noExplicitAny: "any" is used to match the type of the details
    public readonly details?: any,
    message?: string,
    statusCode?: HttpStatus,
  ) {
    const errorMessage = message || ErrorMessages[errorCode];
    const httpStatus = statusCode || BusinessException.getHttpStatus(errorCode);

    super(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          details,
        },
        timestamp: Date.now(),
      },
      httpStatus,
    );
  }

  /**
   * ERROR CODE <-> HTTP STATUS CODE MAPPER
   */
  private static getHttpStatus(errorCode: ErrorCode): HttpStatus {
    switch (errorCode) {
      // 404 NOT_FOUND
      case ErrorCode.USER_NOT_FOUND:
        return HttpStatus.NOT_FOUND;

      // 400 BAD_REQUEST
      case ErrorCode.INVALID_PARAMETER:
        return HttpStatus.BAD_REQUEST;

      // 401 UNAUTHORIZED
      case ErrorCode.INVALID_CREDENTIALS:
      case ErrorCode.INVALID_TOKEN:
      case ErrorCode.TOKEN_EXPIRED:
      case ErrorCode.TOKEN_REVOKED:
        return HttpStatus.UNAUTHORIZED;

      // 409 CONFLICT
      case ErrorCode.EMAIL_ALREADY_EXISTS:
        return HttpStatus.CONFLICT;

      // 400 BAD_REQUEST
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }
}

/**
 * 편의 메서드들
 */
export class BusinessExceptions {
  // 사용자 관련
  static userNotFound(userId: number) {
    return new BusinessException(ErrorCode.USER_NOT_FOUND, { userId });
  }

  static emailAlreadyExists(email: string) {
    return new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS, { email });
  }

  // 인증 관련
  static invalidCredentials() {
    return new BusinessException(ErrorCode.INVALID_CREDENTIALS);
  }

  static invalidToken(details?: any) {
    return new BusinessException(ErrorCode.INVALID_TOKEN, details);
  }

  static tokenExpired() {
    return new BusinessException(ErrorCode.TOKEN_EXPIRED);
  }

  static tokenRevoked(details?: any) {
    return new BusinessException(ErrorCode.TOKEN_REVOKED, details);
  }

  // 공통
  static invalidParameter(details?: any) {
    return new BusinessException(ErrorCode.INVALID_PARAMETER, details);
  }

  static internalServerError(details?: any) {
    return new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, details);
  }

  // 동시성 관련
  static optimisticLockError() {
    return new BusinessException(ErrorCode.OPTIMISTIC_LOCK_ERROR);
  }

  static concurrentModification() {
    return new BusinessException(ErrorCode.CONCURRENT_MODIFICATION);
  }
}
