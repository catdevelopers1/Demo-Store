import { type Env } from '../../../core/db';
import {
  createSuccessResponse,
  createErrorResponse,
  handleZodError,
} from '../../../core/api';
import { requireRole } from '../../../core/security/auth';
import { getR2 } from '../../../core/r2';
import { imageUploadSchema, generateR2Key, MAX_IMAGE_SIZE_BYTES } from '../validation/image';
import {
  getProductImages,
  createProductImageRecord,
  deleteProductImageRecord,
  setPrimaryImage,
} from '../db/imageRepository';
import { ZodError } from 'zod';
import { defaultLogger } from '../../../core/api/logger';

function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1]! : base64;
  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * GET /api/v1/products/:id/images
 * Retrieves all lookbook images for a product
 */
export async function handleGetProductImages(env: Env, productId: string): Promise<Response> {
  const images = await getProductImages(env, productId);
  const response = createSuccessResponse(images, { total: images.length }, 200);
  response.headers.set(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  );
  return response;
}

/**
 * POST /api/v1/admin/images/upload
 * Uploads apparel image to R2 & saves D1 reference (Requires ADMIN role claim)
 */
export async function handleUploadProductImage(request: Request, env: Env): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const input = imageUploadSchema.parse(rawBody);

    const binary = base64ToUint8Array(input.base64Data);
    if (binary.byteLength > MAX_IMAGE_SIZE_BYTES) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Image file size exceeds the maximum limit of 5 MB.',
        undefined,
        400
      );
    }

    const r2Key = generateR2Key(input.productId, input.filename);
    const r2 = getR2(env);
    const url = r2.getPublicUrl(r2Key);

    // 1. Upload to Cloudflare R2 Bucket
    await r2.upload(r2Key, binary, { contentType: input.contentType });

    // 2. Save metadata reference in D1 database
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    try {
      const record = await createProductImageRecord(env, {
        id: imageId,
        productId: input.productId,
        variantId: input.variantId,
        r2Key,
        url,
        altText: input.altText ?? `${input.filename} lookbook`,
        sortOrder: input.sortOrder,
        isPrimary: input.isPrimary,
      });

      return createSuccessResponse(record, {}, 201);
    } catch (dbErr) {
      // Rollback R2 upload if D1 insertion fails to prevent orphaned object storage
      defaultLogger.warn('D1 image record insertion failed, rolling back R2 object upload', {
        key: r2Key,
        error: dbErr instanceof Error ? dbErr.message : String(dbErr),
      });
      await r2.delete(r2Key);
      throw dbErr;
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return handleZodError(err);
    }
    throw err;
  }
}

/**
 * DELETE /api/v1/admin/images/:id
 * Deletes image from R2 bucket & D1 database (Requires ADMIN role claim)
 */
export async function handleDeleteProductImage(
  request: Request,
  env: Env,
  imageId: string
): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const result = await deleteProductImageRecord(env, imageId);
  if ('error' in result) {
    return createErrorResponse('NOT_FOUND', result.error, undefined, 404);
  }

  return createSuccessResponse(result, {}, 200);
}

/**
 * PATCH /api/v1/admin/images/:id/primary
 * Sets image as primary lookbook cover in atomic D1 batch transaction (Requires ADMIN role claim)
 */
export async function handleSetPrimaryProductImage(
  request: Request,
  env: Env,
  imageId: string
): Promise<Response> {
  const authResult = await requireRole(request, env, 'ADMIN');
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const rawBody = (await request.json().catch(() => ({}))) as { productId?: string };
  const url = new URL(request.url);
  const productId = rawBody.productId ?? url.searchParams.get('productId');

  if (!productId) {
    return createErrorResponse('VALIDATION_ERROR', 'productId is required to set primary image.', undefined, 400);
  }

  const result = await setPrimaryImage(env, productId, imageId);
  if ('error' in result) {
    return createErrorResponse('NOT_FOUND', result.error, undefined, 404);
  }

  return createSuccessResponse(result.images, {}, 200);
}
