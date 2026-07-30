import { describe, it, expect } from 'vitest';
import { createSuccessResponse, createErrorResponse } from '../../src/core/api/response';
import { handleZodError } from '../../src/core/api/errors';
import { z } from 'zod';

describe('Edge API Standard Response Envelopes', () => {
  it('creates a standard success JSON envelope with 200 status', async () => {
    const response = createSuccessResponse({ orderNumber: '#PK-10045', status: 'CONFIRMED' });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const json = await response.json();
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('data.orderNumber', '#PK-10045');
    expect(json).toHaveProperty('meta.timestamp');
  });

  it('creates a standard error JSON envelope with specified status code', async () => {
    const response = createErrorResponse(
      'OUT_OF_STOCK',
      'Requested SKU is out of stock',
      [{ field: 'sku', issue: 'Quantity 0' }],
      400
    );

    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json).toHaveProperty('success', false);
    expect(json).toHaveProperty('error.code', 'OUT_OF_STOCK');
    expect(json).toHaveProperty('error.message', 'Requested SKU is out of stock');
    expect(json).toHaveProperty('error.details');
    expect(json).toHaveProperty('meta.timestamp');
  });

  it('formats ZodError into standard error response envelope', async () => {
    const schema = z.object({
      phone: z.string().regex(/^(\+92|0|92)?3[0-9]{9}$/, 'Invalid Pakistani mobile format'),
    });

    const result = schema.safeParse({ phone: '12345' });
    expect(result.success).toBe(false);

    if (!result.success) {
      const response = handleZodError(result.error, 'req_test_01');
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json).toHaveProperty('success', false);
      expect(json).toHaveProperty('error.code', 'VALIDATION_ERROR');
      expect(json).toHaveProperty('error.details.0.field', 'phone');
      expect(json).toHaveProperty('meta.requestId', 'req_test_01');
    }
  });
});
