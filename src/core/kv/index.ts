import type { KVNamespace } from '@cloudflare/workers-types';
import type { Env } from '../db';

export interface KVPutOptions {
  expirationTtl?: number;
  expiration?: number;
}

/**
 * Cloudflare KV Edge Cache Client
 */
export class KVCacheClient {
  constructor(private readonly kv: KVNamespace) {}

  /**
   * Reads a JSON object from Cloudflare KV
   */
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.kv.get(key, 'text');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Writes a JSON object to Cloudflare KV with optional TTL
   */
  async putJson<T>(key: string, value: T, options?: KVPutOptions): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.kv.put(key, serialized, options);
  }

  /**
   * Deletes a key from Cloudflare KV
   */
  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}

/**
 * Returns a typed KV wrapper instance from the Cloudflare environment
 */
export function getKv(env: Env): KVCacheClient {
  if (!env.KV) {
    throw new Error('Cloudflare KV binding "KV" is not configured in the environment.');
  }
  return new KVCacheClient(env.KV);
}
