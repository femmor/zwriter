import bcrypt from 'bcryptjs';
import { DEFAULT_SALT_ROUNDS } from './constants';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, DEFAULT_SALT_ROUNDS);
}

export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check password length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase.
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase.
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers.
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Checks for common special characters in password. 
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}