import type { PaginatedResponse, PaginationInfo } from "../types/response.type";

/**
 * Create Response Utility
 */
/**
 * Response Creation Utility
 */
export class ResponseUtil {
  /**
   * Create Pagination Info
   */
  static createPaginationInfo(
    page: number,
    size: number,
    total: number,
  ): PaginationInfo {
    const totalPages = Math.ceil(total / size);

    return {
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Create Paginated Response
   */
  static createPaginatedResponse<T>(
    items: T[],
    page: number,
    size: number,
    total: number,
  ): PaginatedResponse<T> {
    return {
      items,
      pagination: ResponseUtil.createPaginationInfo(page, size, total),
    };
  }

  /**
   * Normalize Pagination
   */
  static normalizePagination(page?: number, size?: number) {
    const normalizedPage = Math.max(1, page || 1);
    const normalizedSize = Math.min(100, Math.max(1, size || 20));

    return {
      page: normalizedPage,
      size: normalizedSize,
      skip: (normalizedPage - 1) * normalizedSize,
      take: normalizedSize,
    };
  }
}

/**
 * Sort Utility
 */
export class SortUtil {
  /**
   * Normalize Sort Order
   */
  static normalizeSortOrder(
    sortBy?: string,
    sortOrder?: "ASC" | "DESC",
    allowedFields: string[] = [],
  ) {
    const normalizedSortBy = allowedFields.includes(sortBy)
      ? sortBy
      : allowedFields[0];
    const normalizedSortOrder = sortOrder === "ASC" ? "ASC" : "DESC";

    return {
      [normalizedSortBy]: normalizedSortOrder,
    };
  }
}
