import { getDb, type Env } from '../../../core/db';
import type { CustomerAddress, CustomerProfileWithAddresses } from '../types';
import type { PakistanProvince } from '../utils/pakistanLocations';
import type { CreateAddressInput, UpdateAddressInput } from '../validation';

export interface AddressRow {
  id: string;
  customer_id: string;
  recipient_name: string;
  phone: string;
  city: string;
  province_state: PakistanProvince;
  street_address: string;
  postal_code: string | null;
  is_default: number;
  created_at: string;
}

export interface ProfileRow {
  user_id: string;
  default_address_id: string | null;
  created_at: string;
}

function mapRowToAddress(row: AddressRow): CustomerAddress {
  return {
    id: row.id,
    customerId: row.customer_id,
    recipientName: row.recipient_name,
    phone: row.phone,
    city: row.city,
    provinceState: row.province_state,
    streetAddress: row.street_address,
    postalCode: row.postal_code,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
  };
}

/**
 * Retrieves all saved Pakistani shipping addresses for a customer
 */
export async function getCustomerAddresses(env: Env, customerId: string): Promise<CustomerAddress[]> {
  const db = getDb(env);
  const rows = await db.query<AddressRow>(
    'SELECT id, customer_id, recipient_name, phone, city, province_state, street_address, postal_code, is_default, created_at FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
    [customerId]
  );
  return rows.results.map(mapRowToAddress);
}

/**
 * Retrieves full customer profile along with their saved addresses
 */
export async function getCustomerProfileWithAddresses(
  env: Env,
  customerId: string
): Promise<CustomerProfileWithAddresses | null> {
  const db = getDb(env);

  const userRow = await db.first<{ id: string; email: string; phone: string | null; created_at: string }>(
    'SELECT id, email, phone, created_at FROM users WHERE id = ? AND is_active = 1',
    [customerId]
  );
  if (!userRow) {
    return null;
  }

  const profileRow = await db.first<ProfileRow>(
    'SELECT user_id, default_address_id, created_at FROM customer_profiles WHERE user_id = ?',
    [customerId]
  );

  const addresses = await getCustomerAddresses(env, customerId);

  return {
    userId: userRow.id,
    email: userRow.email,
    phone: userRow.phone,
    defaultAddressId: profileRow?.default_address_id ?? null,
    addresses,
    createdAt: userRow.created_at,
  };
}

/**
 * Creates a new Pakistani shipping address and manages default address toggling inside an atomic D1 batch transaction
 */
export async function createCustomerAddress(
  env: Env,
  customerId: string,
  data: CreateAddressInput
): Promise<CustomerAddress> {
  const db = getDb(env);

  const existingAddresses = await getCustomerAddresses(env, customerId);
  const isFirstAddress = existingAddresses.length === 0;
  const shouldBeDefault = data.isDefault || isFirstAddress;

  const addressId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const queries: { sql: string; params?: unknown[] }[] = [];

  // Ensure customer profile record exists
  queries.push({
    sql: 'INSERT OR IGNORE INTO customer_profiles (user_id, default_address_id, created_at) VALUES (?, NULL, ?)',
    params: [customerId, now],
  });

  if (shouldBeDefault) {
    queries.push({
      sql: 'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?',
      params: [customerId],
    });
    queries.push({
      sql: 'UPDATE customer_profiles SET default_address_id = ? WHERE user_id = ?',
      params: [addressId, customerId],
    });
  }

  queries.push({
    sql: 'INSERT INTO customer_addresses (id, customer_id, recipient_name, phone, city, province_state, street_address, postal_code, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    params: [
      addressId,
      customerId,
      data.recipientName.trim(),
      data.phone.trim(),
      data.city.trim(),
      data.provinceState,
      data.streetAddress.trim(),
      data.postalCode ? data.postalCode.trim() : null,
      shouldBeDefault ? 1 : 0,
      now,
    ],
  });

  await db.batch(queries);

  return {
    id: addressId,
    customerId,
    recipientName: data.recipientName.trim(),
    phone: data.phone.trim(),
    city: data.city.trim(),
    provinceState: data.provinceState,
    streetAddress: data.streetAddress.trim(),
    postalCode: data.postalCode ? data.postalCode.trim() : null,
    isDefault: shouldBeDefault,
    createdAt: now,
  };
}

/**
 * Updates an existing Pakistani shipping address and toggles default status atomically
 */
export async function updateCustomerAddress(
  env: Env,
  customerId: string,
  addressId: string,
  data: UpdateAddressInput
): Promise<{ address: CustomerAddress } | { error: string }> {
  const db = getDb(env);

  const existing = await db.first<AddressRow>(
    'SELECT id, customer_id, recipient_name, phone, city, province_state, street_address, postal_code, is_default, created_at FROM customer_addresses WHERE id = ? AND customer_id = ?',
    [addressId, customerId]
  );
  if (!existing) {
    return { error: `Address '${addressId}' not found on customer account.` };
  }

  const queries: { sql: string; params?: unknown[] }[] = [];

  if (data.isDefault === true) {
    queries.push({
      sql: 'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?',
      params: [customerId],
    });
    queries.push({
      sql: 'UPDATE customer_profiles SET default_address_id = ? WHERE user_id = ?',
      params: [addressId, customerId],
    });
  }

  const newRecipient = data.recipientName !== undefined ? data.recipientName.trim() : existing.recipient_name;
  const newPhone = data.phone !== undefined ? data.phone.trim() : existing.phone;
  const newCity = data.city !== undefined ? data.city.trim() : existing.city;
  const newProvince = data.provinceState !== undefined ? data.provinceState : existing.province_state;
  const newStreet = data.streetAddress !== undefined ? data.streetAddress.trim() : existing.street_address;
  const newPostal = data.postalCode !== undefined ? (data.postalCode ? data.postalCode.trim() : null) : existing.postal_code;
  const newDefault = data.isDefault !== undefined ? (data.isDefault ? 1 : 0) : existing.is_default;

  queries.push({
    sql: 'UPDATE customer_addresses SET recipient_name = ?, phone = ?, city = ?, province_state = ?, street_address = ?, postal_code = ?, is_default = ? WHERE id = ? AND customer_id = ?',
    params: [newRecipient, newPhone, newCity, newProvince, newStreet, newPostal, newDefault, addressId, customerId],
  });

  await db.batch(queries);

  const updated = await db.first<AddressRow>(
    'SELECT id, customer_id, recipient_name, phone, city, province_state, street_address, postal_code, is_default, created_at FROM customer_addresses WHERE id = ?',
    [addressId]
  );
  if (!updated) {
    return { error: 'Failed to retrieve updated address.' };
  }

  return { address: mapRowToAddress(updated) };
}

/**
 * Deletes an address and promotes remaining address to default if needed
 */
export async function deleteCustomerAddress(
  env: Env,
  customerId: string,
  addressId: string
): Promise<{ success: true; id: string } | { error: string }> {
  const db = getDb(env);

  const existing = await db.first<AddressRow>(
    'SELECT is_default FROM customer_addresses WHERE id = ? AND customer_id = ?',
    [addressId, customerId]
  );
  if (!existing) {
    return { error: `Address '${addressId}' not found on customer account.` };
  }

  const wasDefault = Boolean(existing.is_default);
  await db.query('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?', [
    addressId,
    customerId,
  ]);

  if (wasDefault) {
    // Promote most recent remaining address to default
    const remaining = await getCustomerAddresses(env, customerId);
    if (remaining.length > 0 && remaining[0]) {
      const nextId = remaining[0].id;
      const promoteQueries = [
        {
          sql: 'UPDATE customer_addresses SET is_default = 1 WHERE id = ?',
          params: [nextId],
        },
        {
          sql: 'UPDATE customer_profiles SET default_address_id = ? WHERE user_id = ?',
          params: [nextId, customerId],
        },
      ];
      await db.batch(promoteQueries);
    } else {
      // No remaining addresses -> clear default_address_id
      await db.query('UPDATE customer_profiles SET default_address_id = NULL WHERE user_id = ?', [
        customerId,
      ]);
    }
  }

  return { success: true, id: addressId };
}
