import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ErrorCode, ErrorMessages } from "../types/error.type";
import type { ErrorResponse } from "../types/response.type";
import { BusinessException } from "./business.exception";

/**
 * Global Exception Filter
 * 모든 예외를 처리하고 공통된 에러 응답 형식으로 반환
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  // biome-ignore lint/suspicious/noExplicitAny: "any" is used to match the type of the exception
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: ErrorResponse;
    let statusCode: HttpStatus;

    if (exception instanceof BusinessException) {
      // BusinessException
      statusCode = exception.getStatus();
      errorResponse = exception.getResponse() as ErrorResponse;
    } else if (exception instanceof HttpException) {
      // Http Exception
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === "object" &&
        "message" in exceptionResponse
      ) {
        errorResponse = {
          success: false,
          error: {
            code: ErrorCode.INVALID_PARAMETER,
            message: Array.isArray(exceptionResponse.message)
              ? exceptionResponse.message.join(", ")
              : String(exceptionResponse.message),
            details: exceptionResponse,
          },
          timestamp: Date.now(),
        };
      } else {
        errorResponse = {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: exception.message,
          },
          timestamp: Date.now(),
        };
      }
    } else {
      // 알 수 없는 예외 처리
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessages[ErrorCode.INTERNAL_SERVER_ERROR],
          details: exception.message,
        },
        timestamp: Date.now(),
      };
    }

    // log record
    this.logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      "GlobalExceptionFilter",
    );

    // response return
    response.status(statusCode).json(errorResponse);
  }
}
