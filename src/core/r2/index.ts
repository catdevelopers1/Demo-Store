import type { R2Bucket } from '@cloudflare/workers-types';
import type { Env } from '../db';
import { defaultLogger } from '../api/logger';

export interface R2PutOptions {
  contentType: string;
  cacheControl?: string;
}

/**
 * Cloudflare R2 Object Storage Wrapper
 */
export class R2StorageClient {
  constructor(
    private readonly bucket: R2Bucket,
    private readonly publicCdnBase = 'https://images.pakistaniclothing.pk'
  ) {}

  /**
   * Writes an image asset object to Cloudflare R2 bucket with MIME metadata
   */
  async upload(key: string, data: ArrayBuffer | Uint8Array, options: R2PutOptions): Promise<void> {
    await this.bucket.put(key, data, {
      httpMetadata: {
        contentType: options.contentType,
        cacheControl: options.cacheControl ?? 'public, max-age=31536000, immutable',
      },
    });
  }

  /**
   * Deletes an object from Cloudflare R2 bucket
   */
  async delete(key: string): Promise<void> {
    try {
      await this.bucket.delete(key);
    } catch (err) {
      defaultLogger.error('Failed to delete object from R2 bucket', {
        key,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Generates public CDN URL for an R2 object key
   */
  getPublicUrl(key: string): string {
    const cleanKey = key.startsWith('/') ? key.substring(1) : key;
    return `${this.publicCdnBase}/${cleanKey}`;
  }
}

/**
 * Returns a typed R2 wrapper instance from the Cloudflare environment
 */
export function getR2(env: Env): R2StorageClient {
  if (!env.BUCKET) {
    throw new Error('Cloudflare R2 binding "BUCKET" is not configured in the environment.');
  }
  return new R2StorageClient(env.BUCKET);
}
