import { describe, expect, it } from 'vitest';
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  isValidCursor,
  MAX_PAGE_SIZE,
  paginateItems,
} from '../types/pagination.js';

describe('Pagination Utilities', () => {
  describe('encodeCursor / decodeCursor', () => {
    it('should encode and decode cursor data correctly', () => {
      const cursorData = { offset: 20, limit: 10 };
      const encoded = encodeCursor(cursorData);
      const decoded = decodeCursor(encoded);

      expect(decoded).toEqual(cursorData);
    });

    it('should encode cursor with context', () => {
      const cursorData = { offset: 40, limit: 20, context: 'tools' };
      const encoded = encodeCursor(cursorData);
      const decoded = decodeCursor(encoded);

      expect(decoded).toEqual(cursorData);
    });

    it('should return null for invalid cursor', () => {
      expect(decodeCursor('invalid-cursor')).toBeNull();
      expect(decodeCursor('')).toBeNull();
      expect(decodeCursor('not-base64!@#$')).toBeNull();
    });

    it('should return null for cursor with missing fields', () => {
      const invalidData = Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64url');
      expect(decodeCursor(invalidData)).toBeNull();
    });
  });

  describe('isValidCursor', () => {
    it('should return true for valid cursor', () => {
      const cursor = encodeCursor({ offset: 10, limit: 20 });
      expect(isValidCursor(cursor)).toBe(true);
    });

    it('should return false for invalid cursor', () => {
      expect(isValidCursor('invalid')).toBe(false);
      expect(isValidCursor('')).toBe(false);
    });
  });

  describe('paginateItems', () => {
    const testItems = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

    it('should return first page when no cursor is provided', () => {
      const result = paginateItems(testItems);

      expect(result.items.length).toBe(DEFAULT_PAGE_SIZE);
      expect(result.items[0]).toEqual({ id: 1, name: 'Item 1' });
      expect(result.total).toBe(50);
      expect(result.nextCursor).toBeDefined();
    });

    it('should paginate with custom page size', () => {
      const result = paginateItems(testItems, undefined, 10);

      expect(result.items.length).toBe(10);
      expect(result.items[0]).toEqual({ id: 1, name: 'Item 1' });
      expect(result.items[9]).toEqual({ id: 10, name: 'Item 10' });
      expect(result.nextCursor).toBeDefined();
    });

    it('should respect MAX_PAGE_SIZE', () => {
      const result = paginateItems(testItems, undefined, 200);

      expect(result.items.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    });

    it('should return next page with cursor', () => {
      const firstPage = paginateItems(testItems, undefined, 10);
      const secondPage = paginateItems(testItems, firstPage.nextCursor, 10);

      expect(secondPage.items[0]).toEqual({ id: 11, name: 'Item 11' });
      expect(secondPage.items.length).toBe(10);
    });

    it('should not include nextCursor on last page', () => {
      const items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
      const result = paginateItems(items, undefined, 10);

      expect(result.items.length).toBe(5);
      expect(result.nextCursor).toBeUndefined();
    });

    it('should handle empty items array', () => {
      const result = paginateItems([]);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.nextCursor).toBeUndefined();
    });

    it('should handle invalid cursor gracefully', () => {
      const result = paginateItems(testItems, 'invalid-cursor', 10);

      // Should start from beginning when cursor is invalid
      expect(result.items[0]).toEqual({ id: 1, name: 'Item 1' });
    });

    it('should paginate through all items correctly', () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const pageSize = 10;
      const allItems: number[] = [];
      let cursor: string | undefined;

      // Paginate through all pages
      do {
        const result = paginateItems(items, cursor, pageSize);
        allItems.push(...result.items);
        cursor = result.nextCursor;
      } while (cursor);

      expect(allItems).toEqual(items);
      expect(allItems.length).toBe(25);
    });
  });
});
