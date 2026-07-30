import type { D1Database, D1Result, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  BUCKET: R2Bucket;
  ENVIRONMENT?: string;
  DEFAULT_CURRENCY?: string;
  DEFAULT_COUNTRY?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  AUTH_JWT_SECRET?: string;
}

/**
 * Cloudflare D1 Query Helper Wrapper
 */
export class DatabaseClient {
  constructor(private readonly db: D1Database) {}

  /**
   * Executes a prepared query returning all matching rows
   */
  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<D1Result<T>> {
    const statement = this.db.prepare(sql).bind(...params);
    return await statement.all<T>();
  }

  /**
   * Executes a prepared query returning the first matching row or null
   */
  async first<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
    const statement = this.db.prepare(sql).bind(...params);
    return await statement.first<T>();
  }

  /**
   * Executes an atomic batch transaction across multiple prepared statements
   */
  async batch<T = Record<string, unknown>>(
    queries: { sql: string; params?: unknown[] }[]
  ): Promise<D1Result<T>[]> {
    const statements = queries.map((q) => this.db.prepare(q.sql).bind(...(q.params ?? [])));
    return await this.db.batch<T>(statements);
  }
}

/**
 * Returns a typed database wrapper instance from the Cloudflare environment
 */
export function getDb(env: Env): DatabaseClient {
  if (!env.DB) {
    throw new Error('Cloudflare D1 binding "DB" is not configured in the environment.');
  }
  return new DatabaseClient(env.DB);
}
