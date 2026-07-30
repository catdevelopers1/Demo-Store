import type { PakistanProvince } from '../utils/pakistanLocations';

export interface CustomerAddress {
  id: string;
  customerId: string;
  recipientName: string;
  phone: string;
  city: string;
  provinceState: PakistanProvince;
  streetAddress: string;
  postalCode?: string | null;
  isDefault: boolean;
  createdAt?: string;
}

export interface CustomerProfileWithAddresses {
  userId: string;
  email: string;
  phone?: string | null;
  defaultAddressId?: string | null;
  addresses: CustomerAddress[];
  createdAt?: string;
}
