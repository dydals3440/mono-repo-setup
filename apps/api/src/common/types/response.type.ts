/**
 * API Response Type
 */

// Basic Response Interface
export type BaseResponse = {
  success: boolean;
  timestamp: number;
};

// 성공 응답
// biome-ignore lint/suspicious/noExplicitAny: "any" is used to match the type of the data
export interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data: T;
}

// 에러 응답
export interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: string;
    message: string;
    // biome-ignore lint/suspicious/noExplicitAny: "any" is used to match the type of the error details
    details?: any;
  };
}

// Paginated Response Interface
export interface PaginationInfo {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Paginated Response Interface
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Pagination Request Basic DTO Interface
export class PaginationDto {
  page?: number = 1;
  size?: number = 20;
}
