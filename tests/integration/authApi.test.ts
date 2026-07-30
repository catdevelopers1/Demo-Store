import { describe, it, expect, vi } from 'vitest';
import { handleRegister, handleLogin } from '../../src/features/authentication/api';
import type { Env } from '../../src/core/db';
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

describe('Authentication Edge Handlers Integration', () => {
  it('registers a new user and returns 201 Created with Set-Cookie header', async () => {
    const mockFirst = vi.fn().mockResolvedValue(null); // No existing user
    const mockRun = vi.fn().mockResolvedValue({ success: true });
    const mockPrepare = vi.fn().mockImplementation((_sql: string) => ({
      bind: () => ({
        first: mockFirst,
        all: vi.fn().mockResolvedValue({ success: true, results: [] }),
        run: mockRun,
      }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
      AUTH_JWT_SECRET: 'test_jwt_secret_64_bytes_0000000000000000000000000000000000000000',
    };

    const request = new Request('https://edge.pakistaniclothing.pk/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@lahore.pk',
        phone: '03001234567',
        password: 'StrongPakistanPassword123!',
        role: 'CUSTOMER',
      }),
    });

    const response = await handleRegister(request, mockEnv);
    expect(response.status).toBe(201);
    expect(response.headers.get('Set-Cookie')).toContain('auth_session=');

    const json = await response.json();
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('data.email', 'customer@lahore.pk');
    expect(json).toHaveProperty('data.role', 'CUSTOMER');
    expect(json).toHaveProperty('data.isActive', true);
  });

  it('logs in an existing user and returns 200 OK with Set-Cookie header', async () => {
    const { hashPassword } = await import('../../src/core/security/crypto');
    const validHash = await hashPassword('CorrectPassword123!');

    const mockUser = {
      id: 'usr_001',
      email: 'customer@lahore.pk',
      phone: '03001234567',
      password_hash: validHash,
      role: 'CUSTOMER',
      is_active: 1,
      created_at: new Date().toISOString(),
    };

    const mockFirst = vi.fn().mockResolvedValue(mockUser);
    const mockPrepare = vi.fn().mockImplementation(() => ({
      bind: () => ({ first: mockFirst }),
    }));

    const mockEnv: Env = {
      DB: { prepare: mockPrepare } as unknown as D1Database,
      KV: {} as unknown as KVNamespace,
      BUCKET: {} as unknown as R2Bucket,
      ENVIRONMENT: 'development',
      AUTH_JWT_SECRET: 'test_jwt_secret_64_bytes_0000000000000000000000000000000000000000',
    };

    const request = new Request('https://edge.pakistaniclothing.pk/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@lahore.pk',
        password: 'CorrectPassword123!',
      }),
    });

    const response = await handleLogin(request, mockEnv);
    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toContain('auth_session=');

    const json = await response.json();
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('data.id', 'usr_001');
    expect(json).toHaveProperty('data.email', 'customer@lahore.pk');
  });
});
