/**
 * MCP Pagination Types
 * Based on MCP Specification 2025-11-25
 * Pagination uses opaque cursor-based approach
 */

/**
 * Default page size for list operations
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum page size for list operations
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  /** Opaque cursor token for pagination */
  cursor?: string;
}

/**
 * Pagination result fields
 */
export interface PaginationResult {
  /** Cursor for the next page (if more results exist) */
  nextCursor?: string;
}

/**
 * Internal cursor data structure (encoded in cursor string)
 */
export interface CursorData {
  /** Starting offset for the page */
  offset: number;
  /** Page size */
  limit: number;
  /** Optional filter/sort context */
  context?: string;
}

/**
 * Generic paginated list result
 */
export interface PaginatedList<T> extends PaginationResult {
  items: T[];
  /** Total number of items (optional) */
  total?: number;
}

/**
 * Encode cursor data to an opaque string
 * @param data The cursor data to encode
 * @returns Base64-encoded cursor string
 */
export function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

/**
 * Decode an opaque cursor string to cursor data
 * @param cursor The cursor string to decode
 * @returns Decoded cursor data or null if invalid
 */
export function decodeCursor(cursor: string): CursorData | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
    const data = JSON.parse(decoded);
    if (typeof data.offset !== 'number' || typeof data.limit !== 'number') {
      return null;
    }
    return data as CursorData;
  } catch {
    return null;
  }
}

/**
 * Paginate an array of items
 * @param items Full array of items
 * @param cursor Optional cursor from previous request
 * @param pageSize Page size (defaults to DEFAULT_PAGE_SIZE)
 * @returns Paginated result with items and optional nextCursor
 */
export function paginateItems<T>(
  items: T[],
  cursor?: string,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedList<T> {
  const limit = Math.min(pageSize, MAX_PAGE_SIZE);
  let offset = 0;

  if (cursor) {
    const cursorData = decodeCursor(cursor);
    if (cursorData) {
      offset = cursorData.offset;
    }
  }

  const paginatedItems = items.slice(offset, offset + limit);
  const hasMore = offset + limit < items.length;

  const result: PaginatedList<T> = {
    items: paginatedItems,
    total: items.length,
  };

  if (hasMore) {
    result.nextCursor = encodeCursor({
      offset: offset + limit,
      limit,
    });
  }

  return result;
}

/**
 * Create initial cursor for a list operation
 * @param pageSize Page size
 * @returns Initial cursor data
 */
export function createInitialCursor(pageSize: number = DEFAULT_PAGE_SIZE): CursorData {
  return {
    offset: 0,
    limit: Math.min(pageSize, MAX_PAGE_SIZE),
  };
}

/**
 * Validate a cursor string
 * @param cursor The cursor to validate
 * @returns True if the cursor is valid
 */
export function isValidCursor(cursor: string): boolean {
  return decodeCursor(cursor) !== null;
}
