import { describe, it, expect } from 'vitest';
import {
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_SIZE_BYTES,
  imageUploadSchema,
  generateR2Key,
} from '../../src/features/products/validation/image';

describe('R2 Lookbook Image MIME & Size Validation', () => {
  it('accepts allowed WebP, JPEG, PNG, and AVIF MIME formats', () => {
    expect(ALLOWED_IMAGE_MIMES).toContain('image/webp');
    expect(ALLOWED_IMAGE_MIMES).toContain('image/jpeg');
    expect(ALLOWED_IMAGE_MIMES).toContain('image/png');
    expect(ALLOWED_IMAGE_MIMES).toContain('image/avif');
  });

  it('rejects unsupported file formats', () => {
    const invalid = {
      productId: 'prod_lawn_01',
      filename: 'script.exe',
      contentType: 'application/x-msdownload',
      base64Data: 'data:image/webp;base64,1234567890abcdef',
    };

    const result = imageUploadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('enforces a maximum 5 MB ceiling on image sizes', () => {
    expect(MAX_IMAGE_SIZE_BYTES).toBe(5242880);
  });
});

describe('Cloudflare R2 Object Key Generator', () => {
  it('formats structured R2 storage keys with timestamp and clean filename', () => {
    const key = generateR2Key('prod_lawn_01', 'Gul e Bahar Front.webp');
    expect(key).toContain('products/prod_lawn_01/');
    expect(key).toContain('gul-e-bahar-front');
    expect(key.endsWith('.webp')).toBe(true);
  });
});
