import { z } from 'zod';
import { slugify } from '../../categories/utils';

export const ALLOWED_IMAGE_MIMES = ['image/webp', 'image/jpeg', 'image/png', 'image/avif'] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB ceiling

export const imageUploadSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().nullable().optional(),
  altText: z.string().nullable().optional(),
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.enum(ALLOWED_IMAGE_MIMES, {
    message: 'Image format must be one of: webp, jpeg, png, avif',
  }),
  base64Data: z.string().min(10, 'Base64 image payload is required'),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(1),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

/**
 * Generates a clean R2 storage object key
 * e.g., "products/prod_lawn_01/1753800000000-front-lookbook.webp"
 */
export function generateR2Key(productId: string, filename: string): string {
  const cleanName = slugify(filename.replace(/\.[^/.]+$/, ''));
  const ext = filename.split('.').pop()?.toLowerCase() || 'webp';
  return `products/${productId}/${Date.now()}-${cleanName}.${ext}`;
}
