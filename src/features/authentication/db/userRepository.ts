import { getDb, type Env } from '../../../core/db';
import type { UserRole } from '../../../core/security/crypto';
import type { UserProfile } from '../types';

export interface UserRecord {
  id: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: UserRole;
  is_active: number;
  created_at: string;
}

export interface CreateUserData {
  id: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role: UserRole;
}

/**
 * Finds an active or inactive user by their email address
 */
export async function findUserByEmail(env: Env, email: string): Promise<UserRecord | null> {
  const db = getDb(env);
  const normalizedEmail = email.toLowerCase().trim();
  return await db.first<UserRecord>(
    'SELECT id, email, phone, password_hash, role, is_active, created_at FROM users WHERE LOWER(email) = ?',
    [normalizedEmail]
  );
}

/**
 * Finds a user by ID
 */
export async function findUserById(env: Env, id: string): Promise<UserProfile | null> {
  const db = getDb(env);
  const row = await db.first<UserRecord>(
    'SELECT id, email, phone, role, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

/**
 * Checks whether an email or Pakistani phone number is already registered
 */
export async function checkUserExists(
  env: Env,
  email: string,
  phone?: string | null
): Promise<{ exists: boolean; field?: string }> {
  const db = getDb(env);
  const normalizedEmail = email.toLowerCase().trim();
  const byEmail = await db.first<{ id: string }>(
    'SELECT id FROM users WHERE LOWER(email) = ?',
    [normalizedEmail]
  );
  if (byEmail) {
    return { exists: true, field: 'email' };
  }

  if (phone) {
    const byPhone = await db.first<{ id: string }>('SELECT id FROM users WHERE phone = ?', [
      phone.trim(),
    ]);
    if (byPhone) {
      return { exists: true, field: 'phone' };
    }
  }

  return { exists: false };
}

/**
 * Inserts a new user record into D1
 */
export async function createUser(env: Env, data: CreateUserData): Promise<UserProfile> {
  const db = getDb(env);
  const normalizedEmail = data.email.toLowerCase().trim();
  const now = new Date().toISOString();

  await db.query(
    'INSERT INTO users (id, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
    [
      data.id,
      normalizedEmail,
      data.phone ? data.phone.trim() : null,
      data.passwordHash,
      data.role,
      now,
      now,
    ]
  );

  return {
    id: data.id,
    email: normalizedEmail,
    phone: data.phone,
    role: data.role,
    isActive: true,
    createdAt: now,
  };
}
