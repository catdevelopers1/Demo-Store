import type { UserRole } from '../../../core/security/crypto';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthSessionResponse {
  user: UserProfile;
  authenticated: boolean;
}
