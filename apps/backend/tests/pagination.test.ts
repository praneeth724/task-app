import { toPaginatedResult } from '../src/common/pagination';

describe('toPaginatedResult', () => {
  it('computes totalPages by rounding up', () => {
    const result = toPaginatedResult([1, 2], 5, { page: 1, limit: 2 });
    expect(result.meta).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });
  });

  it('returns at least 1 page when there is no data', () => {
    const result = toPaginatedResult([], 0, { page: 1, limit: 10 });
    expect(result.meta.totalPages).toBe(1);
  });
});
